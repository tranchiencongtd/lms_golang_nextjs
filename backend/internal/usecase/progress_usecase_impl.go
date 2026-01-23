package usecase

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/domain"
	"github.com/mathvn/backend/internal/repository"
)

type progressUseCaseImpl struct {
	progressRepo   repository.ProgressRepository
	enrollmentRepo repository.EnrollmentRepository
}

// NewProgressUseCase creates a new progress use case
func NewProgressUseCase(
	progressRepo repository.ProgressRepository,
	enrollmentRepo repository.EnrollmentRepository,
) ProgressUseCase {
	return &progressUseCaseImpl{
		progressRepo:   progressRepo,
		enrollmentRepo: enrollmentRepo,
	}
}

// GetCourseProgress returns the user's progress in a course
func (u *progressUseCaseImpl) GetCourseProgress(ctx context.Context, userID, courseID uuid.UUID) (*domain.CourseProgress, error) {
	// Verify user is enrolled
	enrollment, err := u.enrollmentRepo.GetByUserAndCourse(ctx, userID, courseID)
	if err != nil {
		return nil, domain.ErrEnrollmentNotFound
	}

	// Check if enrollment is active
	if enrollment.Status != "active" {
		return nil, domain.ErrEnrollmentExpired
	}

	// Get course progress
	progress, err := u.progressRepo.GetCourseProgress(ctx, userID, courseID)
	if err != nil {
		return nil, err
	}

	return progress, nil
}

// MarkLessonCompleted marks a lesson as completed
func (u *progressUseCaseImpl) MarkLessonCompleted(ctx context.Context, userID, courseID, lessonID uuid.UUID) error {
	// Verify user is enrolled
	enrollment, err := u.enrollmentRepo.GetByUserAndCourse(ctx, userID, courseID)
	if err != nil {
		return domain.ErrEnrollmentNotFound
	}

	if enrollment.Status != "active" {
		return domain.ErrEnrollmentExpired
	}

	// Mark as completed
	return u.progressRepo.MarkCompleted(ctx, userID, courseID, lessonID)
}

// UpdateWatchProgress updates the watch progress for a lesson
func (u *progressUseCaseImpl) UpdateWatchProgress(ctx context.Context, userID, courseID, lessonID uuid.UUID, durationSeconds int) error {
	// Verify user is enrolled
	enrollment, err := u.enrollmentRepo.GetByUserAndCourse(ctx, userID, courseID)
	if err != nil {
		return domain.ErrEnrollmentNotFound
	}

	if enrollment.Status != "active" {
		return domain.ErrEnrollmentExpired
	}

	// Update progress
	progress := &domain.LessonProgress{
		UserID:               userID,
		CourseID:             courseID,
		LessonID:             lessonID,
		IsCompleted:          false,
		LastWatchedAt:        time.Now(),
		WatchDurationSeconds: durationSeconds,
	}

	// Also update last lesson
	_ = u.progressRepo.UpdateLastLesson(ctx, userID, courseID, lessonID)

	return u.progressRepo.Upsert(ctx, progress)
}

// UpdateLastLesson updates which lesson the user was last watching
func (u *progressUseCaseImpl) UpdateLastLesson(ctx context.Context, userID, courseID, lessonID uuid.UUID) error {
	// Verify user is enrolled
	enrollment, err := u.enrollmentRepo.GetByUserAndCourse(ctx, userID, courseID)
	if err != nil {
		return domain.ErrEnrollmentNotFound
	}

	if enrollment.Status != "active" {
		return domain.ErrEnrollmentExpired
	}

	return u.progressRepo.UpdateLastLesson(ctx, userID, courseID, lessonID)
}
