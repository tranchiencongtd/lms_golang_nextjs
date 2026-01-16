package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/domain"
)

// UserRepository defines the interface for user data operations
type UserRepository interface {
	// Create creates a new user
	Create(ctx context.Context, user *domain.User) error

	// GetByID retrieves a user by ID
	GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error)

	// GetByEmail retrieves a user by email
	GetByEmail(ctx context.Context, email string) (*domain.User, error)

	// Update updates an existing user
	Update(ctx context.Context, user *domain.User) error

	// UpdateLastLogin updates the last login timestamp
	UpdateLastLogin(ctx context.Context, id uuid.UUID) error

	// Delete deletes a user by ID
	Delete(ctx context.Context, id uuid.UUID) error

	// ExistsByEmail checks if a user with the given email exists
	ExistsByEmail(ctx context.Context, email string) (bool, error)
}
