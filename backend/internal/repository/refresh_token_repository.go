package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/domain"
)

// RefreshTokenRepository defines the interface for refresh token data operations
type RefreshTokenRepository interface {
	// Create creates a new refresh token
	Create(ctx context.Context, token *domain.RefreshToken) error

	// GetByTokenHash retrieves a refresh token by its hash
	GetByTokenHash(ctx context.Context, tokenHash string) (*domain.RefreshToken, error)

	// GetByUserID retrieves all refresh tokens for a user
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]*domain.RefreshToken, error)

	// Revoke revokes a refresh token by its hash
	Revoke(ctx context.Context, tokenHash string) error

	// RevokeAllForUser revokes all refresh tokens for a user
	RevokeAllForUser(ctx context.Context, userID uuid.UUID) error

	// DeleteExpired deletes expired refresh tokens
	DeleteExpired(ctx context.Context) error
}
