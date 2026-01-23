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

	// GetByPhoneNumber retrieves a user by phone number
	GetByPhoneNumber(ctx context.Context, phoneNumber string) (*domain.User, error)

	// Update updates an existing user
	Update(ctx context.Context, user *domain.User) error

	// Delete deletes a user by ID
	Delete(ctx context.Context, id uuid.UUID) error

	// ExistsByEmail checks if a user with the given email exists
	ExistsByEmail(ctx context.Context, email string) (bool, error)

	// ExistsByPhoneNumber checks if a user with the given phone number exists
	ExistsByPhoneNumber(ctx context.Context, phoneNumber string) (bool, error)

	// Admin methods
	// ListUsersWithPagination returns paginated list of users with optional filters
	ListUsersWithPagination(ctx context.Context, page, limit int, search string, role *domain.UserRole) (*domain.PaginatedUsers, error)

	// UpdateUserRole updates a user's role
	UpdateUserRole(ctx context.Context, userID uuid.UUID, role domain.UserRole) error

	// AdminUpdateUser updates user details by admin
	AdminUpdateUser(ctx context.Context, user *domain.User) error

	// ToggleUserStatus activates or deactivates a user
	ToggleUserStatus(ctx context.Context, userID uuid.UUID, isActive bool) error
}
