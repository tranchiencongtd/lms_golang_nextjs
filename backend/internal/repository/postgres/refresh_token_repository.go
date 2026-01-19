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

// refreshTokenRepository implements repository.RefreshTokenRepository
type refreshTokenRepository struct {
	db *pgxpool.Pool
}

// NewRefreshTokenRepository creates a new PostgreSQL refresh token repository
func NewRefreshTokenRepository(db *pgxpool.Pool) repository.RefreshTokenRepository {
	return &refreshTokenRepository{db: db}
}

// Create creates a new refresh token in the database
func (r *refreshTokenRepository) Create(ctx context.Context, token *domain.RefreshToken) error {
	query := `
		INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, is_revoked, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	now := time.Now()
	if token.ID == uuid.Nil {
		token.ID = uuid.New()
	}
	if token.CreatedAt.IsZero() {
		token.CreatedAt = now
	}
	if token.UpdatedAt.IsZero() {
		token.UpdatedAt = now
	}

	_, err := r.db.Exec(ctx, query,
		token.ID,
		token.UserID,
		token.TokenHash,
		token.ExpiresAt,
		token.IsRevoked,
		token.CreatedAt,
		token.UpdatedAt,
	)

	return err
}

// GetByTokenHash retrieves a refresh token by its hash
func (r *refreshTokenRepository) GetByTokenHash(ctx context.Context, tokenHash string) (*domain.RefreshToken, error) {
	query := `
		SELECT id, user_id, token_hash, expires_at, is_revoked, created_at, updated_at
		FROM refresh_tokens
		WHERE token_hash = $1
	`

	token := &domain.RefreshToken{}
	err := r.db.QueryRow(ctx, query, tokenHash).Scan(
		&token.ID,
		&token.UserID,
		&token.TokenHash,
		&token.ExpiresAt,
		&token.IsRevoked,
		&token.CreatedAt,
		&token.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrInvalidRefreshToken
	}

	return token, err
}

// GetByUserID retrieves all refresh tokens for a user
func (r *refreshTokenRepository) GetByUserID(ctx context.Context, userID uuid.UUID) ([]*domain.RefreshToken, error) {
	query := `
		SELECT id, user_id, token_hash, expires_at, is_revoked, created_at, updated_at
		FROM refresh_tokens
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tokens []*domain.RefreshToken
	for rows.Next() {
		token := &domain.RefreshToken{}
		if err := rows.Scan(
			&token.ID,
			&token.UserID,
			&token.TokenHash,
			&token.ExpiresAt,
			&token.IsRevoked,
			&token.CreatedAt,
			&token.UpdatedAt,
		); err != nil {
			return nil, err
		}
		tokens = append(tokens, token)
	}

	return tokens, rows.Err()
}

// Revoke revokes a refresh token by its hash
func (r *refreshTokenRepository) Revoke(ctx context.Context, tokenHash string) error {
	query := `
		UPDATE refresh_tokens
		SET is_revoked = true, updated_at = $2
		WHERE token_hash = $1
	`

	result, err := r.db.Exec(ctx, query, tokenHash, time.Now())
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return domain.ErrInvalidRefreshToken
	}

	return nil
}

// RevokeAllForUser revokes all refresh tokens for a user
func (r *refreshTokenRepository) RevokeAllForUser(ctx context.Context, userID uuid.UUID) error {
	query := `
		UPDATE refresh_tokens
		SET is_revoked = true, updated_at = $2
		WHERE user_id = $1 AND is_revoked = false
	`

	_, err := r.db.Exec(ctx, query, userID, time.Now())
	return err
}

// DeleteExpired deletes expired refresh tokens
func (r *refreshTokenRepository) DeleteExpired(ctx context.Context) error {
	query := `
		DELETE FROM refresh_tokens
		WHERE expires_at < $1
	`

	_, err := r.db.Exec(ctx, query, time.Now())
	return err
}
