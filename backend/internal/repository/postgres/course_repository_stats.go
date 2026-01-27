package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
)

// RecalculateCourseStats recalculates and updates course statistics
func (r *courseRepository) RecalculateCourseStats(ctx context.Context, courseID uuid.UUID) error {
	query := `
		WITH stats AS (
			SELECT 
				COUNT(*) as total_lessons,
				COALESCE(SUM(duration_minutes), 0) as duration_minutes
			FROM course_lessons
			WHERE course_id = $1
		)
		UPDATE courses
		SET 
			total_lessons = (SELECT total_lessons FROM stats),
			duration_minutes = (SELECT duration_minutes FROM stats),
			updated_at = $2
		WHERE id = $1
	`

	_, err := r.db.Exec(ctx, query, courseID, time.Now())
	return err
}
