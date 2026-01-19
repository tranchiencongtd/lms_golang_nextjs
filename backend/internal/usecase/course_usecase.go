package usecase

import (
	"context"

	"github.com/mathvn/backend/internal/domain"
)

// CourseUseCase defines the interface for course use cases
type CourseUseCase interface {
	// GetCourse retrieves a course by ID or slug
	GetCourse(ctx context.Context, idOrSlug string) (*domain.Course, error)

	// ListCourses retrieves courses with filters, pagination, and sorting
	ListCourses(ctx context.Context, filter *domain.CourseFilter, sort domain.CourseSort, page, pageSize int) ([]*domain.Course, int, error)

	// GetCourseWithDetails retrieves a course with instructor and sections/lessons
	GetCourseWithDetails(ctx context.Context, idOrSlug string) (*domain.Course, error)
}
