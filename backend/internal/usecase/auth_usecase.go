package usecase

import (
	"context"

	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/domain"
)

// RegisterInput represents the input for user registration
type RegisterInput struct {
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=8"`
	FullName    string `json:"full_name" binding:"required,min=2"`
	PhoneNumber string `json:"phone_number" binding:"required"`
}

// LoginInput represents the input for user login
type LoginInput struct {
	EmailOrPhone string `json:"email_or_phone" binding:"required"`
	Password     string `json:"password" binding:"required"`
}

// AuthOutput represents the output after successful authentication
type AuthOutput struct {
	User        *domain.User `json:"user"`
	AccessToken string       `json:"access_token"`
	ExpiresIn   int64        `json:"expires_in"` // Token expiry in seconds
}

// UserOutput represents the output for user data
type UserOutput struct {
	ID          uuid.UUID       `json:"id"`
	Email       string          `json:"email"`
	FullName    string          `json:"full_name"`
	Avatar      *string         `json:"avatar,omitempty"`
	PhoneNumber string          `json:"phone_number"`
	Role        domain.UserRole `json:"role"`
	IsVerified  bool            `json:"is_verified"`
}

// AuthUseCase defines the interface for authentication use cases
type AuthUseCase interface {
	// Register creates a new user account
	Register(ctx context.Context, input *RegisterInput) (*AuthOutput, error)

	// Login authenticates a user and returns tokens
	Login(ctx context.Context, input *LoginInput) (*AuthOutput, error)

	// GetProfile retrieves the current user's profile
	GetProfile(ctx context.Context, userID uuid.UUID) (*UserOutput, error)

	// ValidateToken validates a JWT token and returns the user ID
	ValidateToken(token string) (uuid.UUID, error)
}
