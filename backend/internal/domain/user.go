package domain

import (
	"time"

	"github.com/google/uuid"
)

// User represents the user entity in the domain layer
type User struct {
	ID           uuid.UUID `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"` // Never expose password hash in JSON
	FullName     string    `json:"full_name"`
	Avatar       *string   `json:"avatar,omitempty"`
	PhoneNumber  string    `json:"phone_number"`
	Role         UserRole  `json:"role"`
	IsActive     bool      `json:"is_active"`
	IsVerified   bool      `json:"is_verified"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// UserRole represents the role of a user
type UserRole string

const (
	RoleStudent    UserRole = "student"
	RoleTeacher    UserRole = "teacher"
	RoleAdmin      UserRole = "admin"
)

// IsValid checks if the role is valid
func (r UserRole) IsValid() bool {
	switch r {
	case RoleStudent, RoleTeacher, RoleAdmin:
		return true
	}
	return false
}
