package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/domain"
)

// EnrollmentRepository defines the interface for enrollment data operations
type EnrollmentRepository interface {
	// Create creates a new enrollment
	Create(ctx context.Context, enrollment *domain.Enrollment) error

	// GetByID retrieves an enrollment by ID
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Enrollment, error)

	// GetByUserAndCourse retrieves an enrollment by user ID and course ID
	GetByUserAndCourse(ctx context.Context, userID, courseID uuid.UUID) (*domain.Enrollment, error)

	// GetByUserID retrieves all enrollments for a user
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]*domain.Enrollment, error)

	// GetByUserIDWithCourse retrieves all enrollments for a user with course details
	GetByUserIDWithCourse(ctx context.Context, userID uuid.UUID) ([]*domain.Enrollment, error)

	// GetByCourseID retrieves all enrollments for a course with pagination
	GetByCourseID(ctx context.Context, courseID uuid.UUID, limit, offset int) ([]*domain.Enrollment, int, error)

	// Update updates an enrollment
	Update(ctx context.Context, enrollment *domain.Enrollment) error

	// Delete deletes an enrollment
	Delete(ctx context.Context, id uuid.UUID) error

	// IsEnrolled checks if a user is enrolled in a course
	IsEnrolled(ctx context.Context, userID, courseID uuid.UUID) (bool, error)

	// CountByUserID returns the number of enrollments for a user
	CountByUserID(ctx context.Context, userID uuid.UUID) (int, error)

	// CountByCourseID returns the number of enrollments for a course
	CountByCourseID(ctx context.Context, courseID uuid.UUID) (int, error)
}
