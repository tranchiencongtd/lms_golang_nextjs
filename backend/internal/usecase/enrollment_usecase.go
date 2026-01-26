package usecase

import (
	"context"

	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/domain"
)

// ActivateCourseInput represents the input for course activation
type ActivateCourseInput struct {
	Code string `json:"code" binding:"required"`
}

// ActivateCourseResult represents the result of course activation
type ActivateCourseResult struct {
	Enrollment *domain.Enrollment `json:"enrollment"`
	Course     *domain.Course     `json:"course"`
}

// CreateActivationCodeInput represents the input for creating an activation code
type CreateActivationCodeInput struct {
	CourseID  uuid.UUID `json:"course_id" binding:"required"`
	MaxUses   *int      `json:"max_uses"`   // Optional: nil = unlimited
	ExpiresAt *string   `json:"expires_at"` // Optional: nil = never expires, format: RFC3339
	Note      *string   `json:"note"`       // Optional note
}

// CreateActivationCodeResult represents the result of creating an activation code
type CreateActivationCodeResult struct {
	ActivationCode *domain.ActivationCode `json:"activation_code"`
}

// EnrollmentUseCase defines the interface for enrollment use cases
type EnrollmentUseCase interface {
	// ActivateCourse redeems an activation code and enrolls the user in the course
	ActivateCourse(ctx context.Context, userID uuid.UUID, input *ActivateCourseInput) (*ActivateCourseResult, error)

	// GetUserEnrollments retrieves all enrollments for a user with course details
	GetUserEnrollments(ctx context.Context, userID uuid.UUID) ([]*domain.Enrollment, error)

	// IsEnrolled checks if a user is enrolled in a specific course
	IsEnrolled(ctx context.Context, userID, courseID uuid.UUID) (bool, error)

	// GetEnrollment retrieves a specific enrollment
	GetEnrollment(ctx context.Context, userID, courseID uuid.UUID) (*domain.Enrollment, error)

	// CreateActivationCode creates a new activation code (admin only)
	CreateActivationCode(ctx context.Context, adminID uuid.UUID, input *CreateActivationCodeInput) (*CreateActivationCodeResult, error)

	// ListActivationCodes lists activation codes (admin only)
	ListActivationCodes(ctx context.Context, page, pageSize int, courseID *string) ([]*domain.ActivationCode, int, error)

	// DeleteActivationCode deletes an activation code (admin only)
	DeleteActivationCode(ctx context.Context, id uuid.UUID) error

	// UpdateActivationCode updates an activation code status (admin only)
	UpdateActivationCode(ctx context.Context, id uuid.UUID, isActive bool) (*domain.ActivationCode, error)
}
