package postgres

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/mathvn/backend/internal/domain"
	"github.com/mathvn/backend/internal/repository"
)

// activationCodeRepository implements repository.ActivationCodeRepository
type activationCodeRepository struct {
	db *pgxpool.Pool
}

// NewActivationCodeRepository creates a new activation code repository
func NewActivationCodeRepository(db *pgxpool.Pool) repository.ActivationCodeRepository {
	return &activationCodeRepository{db: db}
}

// Create creates a new activation code
func (r *activationCodeRepository) Create(ctx context.Context, code *domain.ActivationCode) error {
	query := `
		INSERT INTO activation_codes (id, code, course_id, max_uses, current_uses, expires_at, is_active, created_by, note, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	if code.ID == uuid.Nil {
		code.ID = uuid.New()
	}

	err := r.db.QueryRow(
		ctx,
		query,
		code.ID,
		code.Code,
		code.CourseID,
		code.MaxUses,
		code.CurrentUses,
		code.ExpiresAt,
		code.IsActive,
		code.CreatedBy,
		code.Note,
	).Scan(&code.ID, &code.CreatedAt, &code.UpdatedAt)

	return err
}

// GetByID retrieves an activation code by ID
func (r *activationCodeRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.ActivationCode, error) {
	query := `
		SELECT id, code, course_id, max_uses, current_uses, expires_at, is_active, created_by, note, created_at, updated_at
		FROM activation_codes
		WHERE id = $1
	`

	code := &domain.ActivationCode{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&code.ID,
		&code.Code,
		&code.CourseID,
		&code.MaxUses,
		&code.CurrentUses,
		&code.ExpiresAt,
		&code.IsActive,
		&code.CreatedBy,
		&code.Note,
		&code.CreatedAt,
		&code.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrActivationCodeNotFound
	}
	if err != nil {
		return nil, err
	}

	return code, nil
}

// GetByCode retrieves an activation code by its code string
func (r *activationCodeRepository) GetByCode(ctx context.Context, codeStr string) (*domain.ActivationCode, error) {
	query := `
		SELECT ac.id, ac.code, ac.course_id, ac.max_uses, ac.current_uses, ac.expires_at, ac.is_active, ac.created_by, ac.note, ac.created_at, ac.updated_at,
		       c.id, c.title, c.slug, c.description, c.short_description, c.image_url, c.price, c.level, c.status
		FROM activation_codes ac
		LEFT JOIN courses c ON ac.course_id = c.id
		WHERE ac.code = $1
	`

	code := &domain.ActivationCode{}
	course := &domain.Course{}
	var courseImageURL, courseShortDesc *string

	err := r.db.QueryRow(ctx, query, codeStr).Scan(
		&code.ID,
		&code.Code,
		&code.CourseID,
		&code.MaxUses,
		&code.CurrentUses,
		&code.ExpiresAt,
		&code.IsActive,
		&code.CreatedBy,
		&code.Note,
		&code.CreatedAt,
		&code.UpdatedAt,
		&course.ID,
		&course.Title,
		&course.Slug,
		&course.Description,
		&courseShortDesc,
		&courseImageURL,
		&course.Price,
		&course.Level,
		&course.Status,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrActivationCodeNotFound
	}
	if err != nil {
		return nil, err
	}

	if courseImageURL != nil {
		course.ImageURL = courseImageURL
	}
	if courseShortDesc != nil {
		course.ShortDescription = *courseShortDesc
	}
	code.Course = course

	return code, nil
}

// Update updates an activation code
func (r *activationCodeRepository) Update(ctx context.Context, code *domain.ActivationCode) error {
	query := `
		UPDATE activation_codes
		SET max_uses = $2, expires_at = $3, is_active = $4, note = $5, updated_at = NOW()
		WHERE id = $1
	`

	result, err := r.db.Exec(ctx, query, code.ID, code.MaxUses, code.ExpiresAt, code.IsActive, code.Note)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return domain.ErrActivationCodeNotFound
	}

	return nil
}

// IncrementUses increments the current_uses count by 1
func (r *activationCodeRepository) IncrementUses(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE activation_codes
		SET current_uses = current_uses + 1, updated_at = NOW()
		WHERE id = $1
	`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return domain.ErrActivationCodeNotFound
	}

	return nil
}

// Delete deletes an activation code
func (r *activationCodeRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM activation_codes WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return domain.ErrActivationCodeNotFound
	}

	return nil
}

// List retrieves activation codes with optional course filter and pagination
func (r *activationCodeRepository) List(ctx context.Context, courseID *uuid.UUID, limit, offset int) ([]*domain.ActivationCode, int, error) {
	// Count query
	countQuery := `SELECT COUNT(*) FROM activation_codes WHERE ($1::uuid IS NULL OR course_id = $1)`
	var total int
	err := r.db.QueryRow(ctx, countQuery, courseID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// List query
	query := `
		SELECT id, code, course_id, max_uses, current_uses, expires_at, is_active, created_by, note, created_at, updated_at
		FROM activation_codes
		WHERE ($1::uuid IS NULL OR course_id = $1)
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(ctx, query, courseID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var codes []*domain.ActivationCode
	for rows.Next() {
		code := &domain.ActivationCode{}
		err := rows.Scan(
			&code.ID,
			&code.Code,
			&code.CourseID,
			&code.MaxUses,
			&code.CurrentUses,
			&code.ExpiresAt,
			&code.IsActive,
			&code.CreatedBy,
			&code.Note,
			&code.CreatedAt,
			&code.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		codes = append(codes, code)
	}

	return codes, total, nil
}

// ListByCreator retrieves activation codes created by a specific user
func (r *activationCodeRepository) ListByCreator(ctx context.Context, creatorID uuid.UUID, limit, offset int) ([]*domain.ActivationCode, int, error) {
	// Count query
	countQuery := `SELECT COUNT(*) FROM activation_codes WHERE created_by = $1`
	var total int
	err := r.db.QueryRow(ctx, countQuery, creatorID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// List query
	query := `
		SELECT id, code, course_id, max_uses, current_uses, expires_at, is_active, created_by, note, created_at, updated_at
		FROM activation_codes
		WHERE created_by = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(ctx, query, creatorID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var codes []*domain.ActivationCode
	for rows.Next() {
		code := &domain.ActivationCode{}
		err := rows.Scan(
			&code.ID,
			&code.Code,
			&code.CourseID,
			&code.MaxUses,
			&code.CurrentUses,
			&code.ExpiresAt,
			&code.IsActive,
			&code.CreatedBy,
			&code.Note,
			&code.CreatedAt,
			&code.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		codes = append(codes, code)
	}

	return codes, total, nil
}
