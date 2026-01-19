package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/domain"
)

// CourseRepository defines the interface for course data operations
type CourseRepository interface {
	// Create creates a new course
	Create(ctx context.Context, course *domain.Course) error

	// GetByID retrieves a course by ID
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Course, error)

	// GetBySlug retrieves a course by slug
	GetBySlug(ctx context.Context, slug string) (*domain.Course, error)

	// Update updates an existing course
	Update(ctx context.Context, course *domain.Course) error

	// Delete deletes a course by ID
	Delete(ctx context.Context, id uuid.UUID) error

	// List retrieves courses with filters, pagination, and sorting
	List(ctx context.Context, filter *domain.CourseFilter, sort domain.CourseSort, limit, offset int) ([]*domain.Course, int, error)

	// GetByInstructor retrieves courses by instructor ID
	GetByInstructor(ctx context.Context, instructorID uuid.UUID, limit, offset int) ([]*domain.Course, int, error)

	// CourseSectionRepository defines operations for course sections
	CourseSectionRepository

	// CourseLessonRepository defines operations for course lessons
	CourseLessonRepository
}

// CourseSectionRepository defines operations for course sections
type CourseSectionRepository interface {
	// CreateSection creates a new course section
	CreateSection(ctx context.Context, section *domain.CourseSection) error

	// GetSectionByID retrieves a section by ID
	GetSectionByID(ctx context.Context, id uuid.UUID) (*domain.CourseSection, error)

	// GetSectionsByCourseID retrieves all sections for a course
	GetSectionsByCourseID(ctx context.Context, courseID uuid.UUID) ([]*domain.CourseSection, error)

	// UpdateSection updates a course section
	UpdateSection(ctx context.Context, section *domain.CourseSection) error

	// DeleteSection deletes a course section
	DeleteSection(ctx context.Context, id uuid.UUID) error
}

// CourseLessonRepository defines operations for course lessons
type CourseLessonRepository interface {
	// CreateLesson creates a new course lesson
	CreateLesson(ctx context.Context, lesson *domain.CourseLesson) error

	// GetLessonByID retrieves a lesson by ID
	GetLessonByID(ctx context.Context, id uuid.UUID) (*domain.CourseLesson, error)

	// GetLessonsBySectionID retrieves all lessons for a section
	GetLessonsBySectionID(ctx context.Context, sectionID uuid.UUID) ([]*domain.CourseLesson, error)

	// GetLessonsByCourseID retrieves all lessons for a course
	GetLessonsByCourseID(ctx context.Context, courseID uuid.UUID) ([]*domain.CourseLesson, error)

	// UpdateLesson updates a course lesson
	UpdateLesson(ctx context.Context, lesson *domain.CourseLesson) error

	// DeleteLesson deletes a course lesson
	DeleteLesson(ctx context.Context, id uuid.UUID) error
}
