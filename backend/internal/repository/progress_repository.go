package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/domain"
)

// ProgressRepository defines methods for lesson progress data access
type ProgressRepository interface {
	// GetByUserAndLesson gets progress for a specific lesson
	GetByUserAndLesson(ctx context.Context, userID, lessonID uuid.UUID) (*domain.LessonProgress, error)

	// GetByUserAndCourse gets all progress for a course
	GetByUserAndCourse(ctx context.Context, userID, courseID uuid.UUID) ([]*domain.LessonProgress, error)

	// GetCourseProgress gets aggregated progress stats for a course
	GetCourseProgress(ctx context.Context, userID, courseID uuid.UUID) (*domain.CourseProgress, error)

	// Upsert creates or updates lesson progress
	Upsert(ctx context.Context, progress *domain.LessonProgress) error

	// MarkCompleted marks a lesson as completed
	MarkCompleted(ctx context.Context, userID, courseID, lessonID uuid.UUID) error

	// UpdateLastLesson updates the last lesson watched in enrollment
	UpdateLastLesson(ctx context.Context, userID, courseID, lessonID uuid.UUID) error

	// GetLastLesson gets the last lesson the user was watching
	GetLastLesson(ctx context.Context, userID, courseID uuid.UUID) (*uuid.UUID, error)
}
