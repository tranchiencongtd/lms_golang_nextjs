package domain

import (
	"time"

	"github.com/google/uuid"
)

// LessonProgress represents a user's progress on a specific lesson
type LessonProgress struct {
	ID                   uuid.UUID  `json:"id"`
	UserID               uuid.UUID  `json:"user_id"`
	CourseID             uuid.UUID  `json:"course_id"`
	LessonID             uuid.UUID  `json:"lesson_id"`
	IsCompleted          bool       `json:"is_completed"`
	CompletedAt          *time.Time `json:"completed_at,omitempty"`
	LastWatchedAt        time.Time  `json:"last_watched_at"`
	WatchDurationSeconds int        `json:"watch_duration_seconds"`
	CreatedAt            time.Time  `json:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at"`
}

// CourseProgress represents the overall progress of a user in a course
type CourseProgress struct {
	CourseID         uuid.UUID         `json:"course_id"`
	TotalLessons     int               `json:"total_lessons"`
	CompletedLessons int               `json:"completed_lessons"`
	ProgressPercent  int               `json:"progress_percent"`
	LastLessonID     *uuid.UUID        `json:"last_lesson_id,omitempty"`
	LessonProgress   []*LessonProgress `json:"lesson_progress,omitempty"`
}
