package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/mathvn/backend/internal/domain"
)

type consultationRepository struct {
	db *pgxpool.Pool
}

// NewConsultationRepository creates a new consultation repository
func NewConsultationRepository(db *pgxpool.Pool) domain.ConsultationRepository {
	return &consultationRepository{db: db}
}

// Create creates a new consultation request
func (r *consultationRepository) Create(ctx context.Context, req *domain.ConsultationRequest) error {
	query := `
		INSERT INTO consultation_requests (
			id, student_name, parent_name, phone, birth_year, grade, academic_level, status, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	req.ID = uuid.New()
	now := time.Now()
	req.CreatedAt = now
	req.UpdatedAt = now
	req.Status = "pending"

	_, err := r.db.Exec(ctx, query,
		req.ID,
		req.StudentName,
		req.ParentName,
		req.Phone,
		req.BirthYear,
		req.Grade,
		req.AcademicLevel,
		req.Status,
		req.CreatedAt,
		req.UpdatedAt,
	)

	return err
}

// GetByID gets a consultation request by ID
func (r *consultationRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.ConsultationRequest, error) {
	query := `
		SELECT id, student_name, parent_name, phone, birth_year, grade, academic_level, status, note, created_at, updated_at
		FROM consultation_requests
		WHERE id = $1
	`

	var note *string
	req := &domain.ConsultationRequest{}

	err := r.db.QueryRow(ctx, query, id).Scan(
		&req.ID,
		&req.StudentName,
		&req.ParentName,
		&req.Phone,
		&req.BirthYear,
		&req.Grade,
		&req.AcademicLevel,
		&req.Status,
		&note, // Handle nullable note
		&req.CreatedAt,
		&req.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, domain.ErrConsultationRequestNotFound
		}
		return nil, err
	}

	if note != nil {
		req.Note = *note
	}

	return req, nil
}

// List gets consultation requests with pagination
func (r *consultationRepository) List(ctx context.Context, limit, offset int) ([]*domain.ConsultationRequest, int, error) {
	query := `
		SELECT id, student_name, parent_name, phone, birth_year, grade, academic_level, status, note, created_at, updated_at
		FROM consultation_requests
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var requests []*domain.ConsultationRequest
	for rows.Next() {
		var note *string
		req := &domain.ConsultationRequest{}
		err := rows.Scan(
			&req.ID,
			&req.StudentName,
			&req.ParentName,
			&req.Phone,
			&req.BirthYear,
			&req.Grade,
			&req.AcademicLevel,
			&req.Status,
			&note,
			&req.CreatedAt,
			&req.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		if note != nil {
			req.Note = *note
		}
		requests = append(requests, req)
	}

	// Count total
	var total int
	err = r.db.QueryRow(ctx, "SELECT COUNT(*) FROM consultation_requests").Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	return requests, total, nil
}

// Update updates a consultation request
func (r *consultationRepository) Update(ctx context.Context, req *domain.ConsultationRequest) error {
	query := `
		UPDATE consultation_requests
		SET status = $1, note = $2, updated_at = $3
		WHERE id = $4
	`
	_, err := r.db.Exec(ctx, query, req.Status, req.Note, req.UpdatedAt, req.ID)
	return err
}

// Delete deletes a consultation request
func (r *consultationRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM consultation_requests WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
