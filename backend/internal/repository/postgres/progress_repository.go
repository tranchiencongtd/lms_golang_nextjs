package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/mathvn/backend/internal/domain"
	"github.com/mathvn/backend/internal/repository"
)

type progressRepository struct {
	db *pgxpool.Pool
}

// NewProgressRepository creates a new progress repository
func NewProgressRepository(db *pgxpool.Pool) repository.ProgressRepository {
	return &progressRepository{db: db}
}

// GetByUserAndLesson gets progress for a specific lesson
func (r *progressRepository) GetByUserAndLesson(ctx context.Context, userID, lessonID uuid.UUID) (*domain.LessonProgress, error) {
	query := `
		SELECT id, user_id, course_id, lesson_id, is_completed, completed_at, 
		       last_watched_at, watch_duration_seconds, created_at, updated_at
		FROM lesson_progress
		WHERE user_id = $1 AND lesson_id = $2
	`

	progress := &domain.LessonProgress{}
	err := r.db.QueryRow(ctx, query, userID, lessonID).Scan(
		&progress.ID,
		&progress.UserID,
		&progress.CourseID,
		&progress.LessonID,
		&progress.IsCompleted,
		&progress.CompletedAt,
		&progress.LastWatchedAt,
		&progress.WatchDurationSeconds,
		&progress.CreatedAt,
		&progress.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrLessonProgressNotFound
	}
	if err != nil {
		return nil, err
	}

	return progress, nil
}

// GetByUserAndCourse gets all progress for a course
func (r *progressRepository) GetByUserAndCourse(ctx context.Context, userID, courseID uuid.UUID) ([]*domain.LessonProgress, error) {
	query := `
		SELECT id, user_id, course_id, lesson_id, is_completed, completed_at, 
		       last_watched_at, watch_duration_seconds, created_at, updated_at
		FROM lesson_progress
		WHERE user_id = $1 AND course_id = $2
		ORDER BY last_watched_at DESC
	`

	rows, err := r.db.Query(ctx, query, userID, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var progressList []*domain.LessonProgress
	for rows.Next() {
		progress := &domain.LessonProgress{}
		err := rows.Scan(
			&progress.ID,
			&progress.UserID,
			&progress.CourseID,
			&progress.LessonID,
			&progress.IsCompleted,
			&progress.CompletedAt,
			&progress.LastWatchedAt,
			&progress.WatchDurationSeconds,
			&progress.CreatedAt,
			&progress.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		progressList = append(progressList, progress)
	}

	return progressList, nil
}

// GetCourseProgress gets aggregated progress stats for a course
func (r *progressRepository) GetCourseProgress(ctx context.Context, userID, courseID uuid.UUID) (*domain.CourseProgress, error) {
	// Get total lessons count
	var totalLessons int
	err := r.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM course_lessons WHERE course_id = $1`,
		courseID,
	).Scan(&totalLessons)
	if err != nil {
		return nil, err
	}

	// Get completed lessons count
	var completedLessons int
	err = r.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM lesson_progress 
		 WHERE user_id = $1 AND course_id = $2 AND is_completed = TRUE`,
		userID, courseID,
	).Scan(&completedLessons)
	if err != nil {
		return nil, err
	}

	// Get last lesson
	lastLesson, _ := r.GetLastLesson(ctx, userID, courseID)

	// Get all lesson progress
	lessonProgress, err := r.GetByUserAndCourse(ctx, userID, courseID)
	if err != nil {
		lessonProgress = []*domain.LessonProgress{}
	}

	// Calculate percentage
	progressPercent := 0
	if totalLessons > 0 {
		progressPercent = (completedLessons * 100) / totalLessons
	}

	return &domain.CourseProgress{
		CourseID:         courseID,
		TotalLessons:     totalLessons,
		CompletedLessons: completedLessons,
		ProgressPercent:  progressPercent,
		LastLessonID:     lastLesson,
		LessonProgress:   lessonProgress,
	}, nil
}

// Upsert creates or updates lesson progress
func (r *progressRepository) Upsert(ctx context.Context, progress *domain.LessonProgress) error {
	query := `
		INSERT INTO lesson_progress (id, user_id, course_id, lesson_id, is_completed, completed_at, 
		                             last_watched_at, watch_duration_seconds, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
		ON CONFLICT (user_id, lesson_id) DO UPDATE SET
			is_completed = EXCLUDED.is_completed,
			completed_at = EXCLUDED.completed_at,
			last_watched_at = EXCLUDED.last_watched_at,
			watch_duration_seconds = GREATEST(lesson_progress.watch_duration_seconds, EXCLUDED.watch_duration_seconds),
			updated_at = NOW()
	`

	if progress.ID == uuid.Nil {
		progress.ID = uuid.New()
	}

	_, err := r.db.Exec(ctx, query,
		progress.ID,
		progress.UserID,
		progress.CourseID,
		progress.LessonID,
		progress.IsCompleted,
		progress.CompletedAt,
		progress.LastWatchedAt,
		progress.WatchDurationSeconds,
	)

	return err
}

// MarkCompleted marks a lesson as completed
func (r *progressRepository) MarkCompleted(ctx context.Context, userID, courseID, lessonID uuid.UUID) error {
	now := time.Now()
	progress := &domain.LessonProgress{
		UserID:        userID,
		CourseID:      courseID,
		LessonID:      lessonID,
		IsCompleted:   true,
		CompletedAt:   &now,
		LastWatchedAt: now,
	}
	return r.Upsert(ctx, progress)
}

// UpdateLastLesson updates the last lesson watched in enrollment
func (r *progressRepository) UpdateLastLesson(ctx context.Context, userID, courseID, lessonID uuid.UUID) error {
	query := `
		UPDATE course_enrollments 
		SET last_lesson_id = $3, updated_at = NOW()
		WHERE user_id = $1 AND course_id = $2
	`
	_, err := r.db.Exec(ctx, query, userID, courseID, lessonID)
	return err
}

// GetLastLesson gets the last lesson the user was watching
func (r *progressRepository) GetLastLesson(ctx context.Context, userID, courseID uuid.UUID) (*uuid.UUID, error) {
	query := `
		SELECT last_lesson_id FROM course_enrollments 
		WHERE user_id = $1 AND course_id = $2
	`
	var lastLessonID *uuid.UUID
	err := r.db.QueryRow(ctx, query, userID, courseID).Scan(&lastLessonID)
	if err != nil {
		return nil, err
	}
	return lastLessonID, nil
}
