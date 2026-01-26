package usecase

import (
	"context"

	"github.com/google/uuid"
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

	// Admin operations
	CreateCourse(ctx context.Context, course *domain.Course) error
	UpdateCourse(ctx context.Context, course *domain.Course) error
	DeleteCourse(ctx context.Context, id uuid.UUID) error

	// Section operations
	CreateSection(ctx context.Context, section *domain.CourseSection) error
	UpdateSection(ctx context.Context, section *domain.CourseSection) error
	DeleteSection(ctx context.Context, id uuid.UUID) error

	// Lesson operations
	CreateLesson(ctx context.Context, lesson *domain.CourseLesson) error
	UpdateLesson(ctx context.Context, lesson *domain.CourseLesson) error
	DeleteLesson(ctx context.Context, id uuid.UUID) error
}
