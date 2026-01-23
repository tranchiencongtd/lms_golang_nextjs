package usecase

import (
	"context"

	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/domain"
)

// ProgressUseCase defines the interface for progress-related operations
type ProgressUseCase interface {
	// GetCourseProgress returns the user's progress in a course
	GetCourseProgress(ctx context.Context, userID, courseID uuid.UUID) (*domain.CourseProgress, error)

	// MarkLessonCompleted marks a lesson as completed
	MarkLessonCompleted(ctx context.Context, userID, courseID, lessonID uuid.UUID) error

	// UpdateWatchProgress updates the watch progress for a lesson
	UpdateWatchProgress(ctx context.Context, userID, courseID, lessonID uuid.UUID, durationSeconds int) error

	// UpdateLastLesson updates which lesson the user was last watching
	UpdateLastLesson(ctx context.Context, userID, courseID, lessonID uuid.UUID) error
}
