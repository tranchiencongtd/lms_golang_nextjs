package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/mathvn/backend/internal/domain"
	"github.com/mathvn/backend/internal/repository"
)

// userRepository implements repository.UserRepository
type userRepository struct {
	db *pgxpool.Pool
}

// NewUserRepository creates a new PostgreSQL user repository
func NewUserRepository(db *pgxpool.Pool) repository.UserRepository {
	return &userRepository{db: db}
}

// Create creates a new user in the database
func (r *userRepository) Create(ctx context.Context, user *domain.User) error {
	query := `
		INSERT INTO users (id, email, password_hash, full_name, avatar, role, is_active, is_verified, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	now := time.Now()
	user.ID = uuid.New()
	user.CreatedAt = now
	user.UpdatedAt = now

	_, err := r.db.Exec(ctx, query,
		user.ID,
		user.Email,
		user.PasswordHash,
		user.FullName,
		user.Avatar,
		user.Role,
		user.IsActive,
		user.IsVerified,
		user.CreatedAt,
		user.UpdatedAt,
	)

	return err
}

// GetByID retrieves a user by ID
func (r *userRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	query := `
		SELECT id, email, password_hash, full_name, avatar, role, is_active, is_verified, last_login_at, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	user := &domain.User{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.FullName,
		&user.Avatar,
		&user.Role,
		&user.IsActive,
		&user.IsVerified,
		&user.LastLoginAt,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrUserNotFound
	}

	return user, err
}

// GetByEmail retrieves a user by email
func (r *userRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	query := `
		SELECT id, email, password_hash, full_name, avatar, role, is_active, is_verified, last_login_at, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	user := &domain.User{}
	err := r.db.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.FullName,
		&user.Avatar,
		&user.Role,
		&user.IsActive,
		&user.IsVerified,
		&user.LastLoginAt,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrUserNotFound
	}

	return user, err
}

// Update updates an existing user
func (r *userRepository) Update(ctx context.Context, user *domain.User) error {
	query := `
		UPDATE users
		SET email = $2, password_hash = $3, full_name = $4, avatar = $5, role = $6, 
		    is_active = $7, is_verified = $8, updated_at = $9
		WHERE id = $1
	`

	user.UpdatedAt = time.Now()

	result, err := r.db.Exec(ctx, query,
		user.ID,
		user.Email,
		user.PasswordHash,
		user.FullName,
		user.Avatar,
		user.Role,
		user.IsActive,
		user.IsVerified,
		user.UpdatedAt,
	)

	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return domain.ErrUserNotFound
	}

	return nil
}

// UpdateLastLogin updates the last login timestamp
func (r *userRepository) UpdateLastLogin(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE users SET last_login_at = $2 WHERE id = $1`

	_, err := r.db.Exec(ctx, query, id, time.Now())
	return err
}

// Delete deletes a user by ID
func (r *userRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return domain.ErrUserNotFound
	}

	return nil
}

// ExistsByEmail checks if a user with the given email exists
func (r *userRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`

	var exists bool
	err := r.db.QueryRow(ctx, query, email).Scan(&exists)
	return exists, err
}
