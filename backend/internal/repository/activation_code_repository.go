package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/domain"
)

// ActivationCodeRepository defines the interface for activation code data operations
type ActivationCodeRepository interface {
	// Create creates a new activation code
	Create(ctx context.Context, code *domain.ActivationCode) error

	// GetByID retrieves an activation code by ID
	GetByID(ctx context.Context, id uuid.UUID) (*domain.ActivationCode, error)

	// GetByCode retrieves an activation code by its code string
	GetByCode(ctx context.Context, code string) (*domain.ActivationCode, error)

	// Update updates an activation code
	Update(ctx context.Context, code *domain.ActivationCode) error

	// IncrementUses increments the current_uses count by 1
	IncrementUses(ctx context.Context, id uuid.UUID) error

	// Delete deletes an activation code
	Delete(ctx context.Context, id uuid.UUID) error

	// List retrieves activation codes with optional course filter and pagination
	List(ctx context.Context, courseID *uuid.UUID, limit, offset int) ([]*domain.ActivationCode, int, error)

	// ListByCreator retrieves activation codes created by a specific user
	ListByCreator(ctx context.Context, creatorID uuid.UUID, limit, offset int) ([]*domain.ActivationCode, int, error)
}
