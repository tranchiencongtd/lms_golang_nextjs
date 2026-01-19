package postgres

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/mathvn/backend/internal/domain"
	"github.com/mathvn/backend/internal/repository"
)

// courseRepository implements repository.CourseRepository
type courseRepository struct {
	db *pgxpool.Pool
}

// NewCourseRepository creates a new PostgreSQL course repository
func NewCourseRepository(db *pgxpool.Pool) repository.CourseRepository {
	return &courseRepository{db: db}
}

// Create creates a new course
func (r *courseRepository) Create(ctx context.Context, course *domain.Course) error {
	query := `
		INSERT INTO courses (
			id, title, slug, description, short_description, instructor_id,
			price, original_price, image_url, video_preview_url,
			rating, total_reviews, total_students, total_lessons, duration_minutes,
			level, grade, status, is_featured, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
	`

	now := time.Now()
	course.ID = uuid.New()
	course.CreatedAt = now
	course.UpdatedAt = now

	_, err := r.db.Exec(ctx, query,
		course.ID,
		course.Title,
		course.Slug,
		course.Description,
		course.ShortDescription,
		course.InstructorID,
		course.Price,
		course.OriginalPrice,
		course.ImageURL,
		course.VideoPreviewURL,
		course.Rating,
		course.TotalReviews,
		course.TotalStudents,
		course.TotalLessons,
		course.DurationMinutes,
		course.Level,
		course.Grade,
		course.Status,
		course.IsFeatured,
		course.CreatedAt,
		course.UpdatedAt,
	)

	return err
}

// GetByID retrieves a course by ID
func (r *courseRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Course, error) {
	query := `
		SELECT id, title, slug, description, short_description, instructor_id,
		       price, original_price, image_url, video_preview_url,
		       rating, total_reviews, total_students, total_lessons, duration_minutes,
		       level, grade, status, is_featured, created_at, updated_at
		FROM courses
		WHERE id = $1
	`

	course := &domain.Course{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&course.ID,
		&course.Title,
		&course.Slug,
		&course.Description,
		&course.ShortDescription,
		&course.InstructorID,
		&course.Price,
		&course.OriginalPrice,
		&course.ImageURL,
		&course.VideoPreviewURL,
		&course.Rating,
		&course.TotalReviews,
		&course.TotalStudents,
		&course.TotalLessons,
		&course.DurationMinutes,
		&course.Level,
		&course.Grade,
		&course.Status,
		&course.IsFeatured,
		&course.CreatedAt,
		&course.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrCourseNotFound
	}

	return course, err
}

// GetBySlug retrieves a course by slug
func (r *courseRepository) GetBySlug(ctx context.Context, slug string) (*domain.Course, error) {
	query := `
		SELECT id, title, slug, description, short_description, instructor_id,
		       price, original_price, image_url, video_preview_url,
		       rating, total_reviews, total_students, total_lessons, duration_minutes,
		       level, grade, status, is_featured, created_at, updated_at
		FROM courses
		WHERE slug = $1
	`

	course := &domain.Course{}
	err := r.db.QueryRow(ctx, query, slug).Scan(
		&course.ID,
		&course.Title,
		&course.Slug,
		&course.Description,
		&course.ShortDescription,
		&course.InstructorID,
		&course.Price,
		&course.OriginalPrice,
		&course.ImageURL,
		&course.VideoPreviewURL,
		&course.Rating,
		&course.TotalReviews,
		&course.TotalStudents,
		&course.TotalLessons,
		&course.DurationMinutes,
		&course.Level,
		&course.Grade,
		&course.Status,
		&course.IsFeatured,
		&course.CreatedAt,
		&course.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrCourseNotFound
	}

	return course, err
}

// Update updates an existing course
func (r *courseRepository) Update(ctx context.Context, course *domain.Course) error {
	query := `
		UPDATE courses
		SET title = $2, slug = $3, description = $4, short_description = $5,
		    price = $6, original_price = $7, image_url = $8, video_preview_url = $9,
		    rating = $10, total_reviews = $11, total_students = $12, total_lessons = $13,
		    duration_minutes = $14, level = $15, grade = $16,
		    status = $17, is_featured = $18, updated_at = $19
		WHERE id = $1
	`

	course.UpdatedAt = time.Now()

	result, err := r.db.Exec(ctx, query,
		course.ID,
		course.Title,
		course.Slug,
		course.Description,
		course.ShortDescription,
		course.Price,
		course.OriginalPrice,
		course.ImageURL,
		course.VideoPreviewURL,
		course.Rating,
		course.TotalReviews,
		course.TotalStudents,
		course.TotalLessons,
		course.DurationMinutes,
		course.Level,
		course.Grade,
		course.Status,
		course.IsFeatured,
		course.UpdatedAt,
	)

	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return domain.ErrCourseNotFound
	}

	return nil
}

// Delete deletes a course by ID
func (r *courseRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM courses WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return domain.ErrCourseNotFound
	}

	return nil
}

// List retrieves courses with filters, pagination, and sorting
func (r *courseRepository) List(ctx context.Context, filter *domain.CourseFilter, sort domain.CourseSort, limit, offset int) ([]*domain.Course, int, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	// Build WHERE clause
	if filter != nil {
		if filter.Status != nil {
			conditions = append(conditions, fmt.Sprintf("status = $%d", argIndex))
			args = append(args, *filter.Status)
			argIndex++
		}
		if len(filter.Levels) > 0 {
			levels := make([]string, 0, len(filter.Levels))
			for _, lv := range filter.Levels {
				if lv != "" {
					levels = append(levels, string(lv))
				}
			}
			if len(levels) > 0 {
				conditions = append(conditions, fmt.Sprintf("level = ANY($%d)", argIndex))
				args = append(args, levels)
				argIndex++
			}
		}
		if len(filter.Grades) > 0 {
			grades := make([]string, 0, len(filter.Grades))
			for _, g := range filter.Grades {
				if g != "" {
					grades = append(grades, g)
				}
			}
			if len(grades) > 0 {
				conditions = append(conditions, fmt.Sprintf("grade = ANY($%d)", argIndex))
				args = append(args, grades)
				argIndex++
			}
		}
		if filter.InstructorID != nil {
			conditions = append(conditions, fmt.Sprintf("instructor_id = $%d", argIndex))
			args = append(args, *filter.InstructorID)
			argIndex++
		}
		if filter.IsFeatured != nil {
			conditions = append(conditions, fmt.Sprintf("is_featured = $%d", argIndex))
			args = append(args, *filter.IsFeatured)
			argIndex++
		}
		if filter.Search != nil && *filter.Search != "" {
			conditions = append(conditions, fmt.Sprintf("(title ILIKE $%d OR description ILIKE $%d)", argIndex, argIndex))
			searchTerm := "%" + *filter.Search + "%"
			args = append(args, searchTerm)
			argIndex++
		}
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// Build ORDER BY clause
	orderBy := "created_at DESC"
	switch sort {
	case domain.SortCreatedAtAsc:
		orderBy = "created_at ASC"
	case domain.SortPriceAsc:
		orderBy = "price ASC"
	case domain.SortPriceDesc:
		orderBy = "price DESC"
	case domain.SortRatingDesc:
		orderBy = "rating DESC"
	case domain.SortStudentsDesc:
		orderBy = "total_students DESC"
	}

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM courses %s", whereClause)
	var total int
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Get courses
	query := fmt.Sprintf(`
		SELECT id, title, slug, description, short_description, instructor_id,
		       price, original_price, image_url, video_preview_url,
		       rating, total_reviews, total_students, total_lessons, duration_minutes,
		       level, grade, status, is_featured, created_at, updated_at
		FROM courses
		%s
		ORDER BY %s
		LIMIT $%d OFFSET $%d
	`, whereClause, orderBy, argIndex, argIndex+1)

	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var courses []*domain.Course
	for rows.Next() {
		course := &domain.Course{}
		err := rows.Scan(
			&course.ID,
			&course.Title,
			&course.Slug,
			&course.Description,
			&course.ShortDescription,
			&course.InstructorID,
			&course.Price,
			&course.OriginalPrice,
			&course.ImageURL,
			&course.VideoPreviewURL,
			&course.Rating,
			&course.TotalReviews,
			&course.TotalStudents,
			&course.TotalLessons,
			&course.DurationMinutes,
			&course.Level,
			&course.Grade,
			&course.Status,
			&course.IsFeatured,
			&course.CreatedAt,
			&course.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		courses = append(courses, course)
	}

	return courses, total, rows.Err()
}

// GetByInstructor retrieves courses by instructor ID
func (r *courseRepository) GetByInstructor(ctx context.Context, instructorID uuid.UUID, limit, offset int) ([]*domain.Course, int, error) {
	filter := &domain.CourseFilter{
		InstructorID: &instructorID,
	}
	return r.List(ctx, filter, domain.SortCreatedAtDesc, limit, offset)
}

// Section methods

// CreateSection creates a new course section
func (r *courseRepository) CreateSection(ctx context.Context, section *domain.CourseSection) error {
	query := `
		INSERT INTO course_sections (id, course_id, title, description, order_index, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	now := time.Now()
	section.ID = uuid.New()
	section.CreatedAt = now
	section.UpdatedAt = now

	_, err := r.db.Exec(ctx, query,
		section.ID,
		section.CourseID,
		section.Title,
		section.Description,
		section.OrderIndex,
		section.CreatedAt,
		section.UpdatedAt,
	)

	return err
}

// GetSectionByID retrieves a section by ID
func (r *courseRepository) GetSectionByID(ctx context.Context, id uuid.UUID) (*domain.CourseSection, error) {
	query := `
		SELECT id, course_id, title, description, order_index, created_at, updated_at
		FROM course_sections
		WHERE id = $1
	`

	section := &domain.CourseSection{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&section.ID,
		&section.CourseID,
		&section.Title,
		&section.Description,
		&section.OrderIndex,
		&section.CreatedAt,
		&section.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrCourseSectionNotFound
	}

	return section, err
}

// GetSectionsByCourseID retrieves all sections for a course
func (r *courseRepository) GetSectionsByCourseID(ctx context.Context, courseID uuid.UUID) ([]*domain.CourseSection, error) {
	query := `
		SELECT id, course_id, title, description, order_index, created_at, updated_at
		FROM course_sections
		WHERE course_id = $1
		ORDER BY order_index ASC
	`

	rows, err := r.db.Query(ctx, query, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sections []*domain.CourseSection
	for rows.Next() {
		section := &domain.CourseSection{}
		err := rows.Scan(
			&section.ID,
			&section.CourseID,
			&section.Title,
			&section.Description,
			&section.OrderIndex,
			&section.CreatedAt,
			&section.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		sections = append(sections, section)
	}

	return sections, rows.Err()
}

// UpdateSection updates a course section
func (r *courseRepository) UpdateSection(ctx context.Context, section *domain.CourseSection) error {
	query := `
		UPDATE course_sections
		SET title = $2, description = $3, order_index = $4, updated_at = $5
		WHERE id = $1
	`

	section.UpdatedAt = time.Now()

	result, err := r.db.Exec(ctx, query,
		section.ID,
		section.Title,
		section.Description,
		section.OrderIndex,
		section.UpdatedAt,
	)

	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return domain.ErrCourseSectionNotFound
	}

	return nil
}

// DeleteSection deletes a course section
func (r *courseRepository) DeleteSection(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM course_sections WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return domain.ErrCourseSectionNotFound
	}

	return nil
}

// Lesson methods

// CreateLesson creates a new course lesson
func (r *courseRepository) CreateLesson(ctx context.Context, lesson *domain.CourseLesson) error {
	query := `
		INSERT INTO course_lessons (
			id, section_id, course_id, title, description,
			video_url, youtube_id, duration_minutes, order_index, is_preview,
			created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`

	now := time.Now()
	lesson.ID = uuid.New()
	lesson.CreatedAt = now
	lesson.UpdatedAt = now

	_, err := r.db.Exec(ctx, query,
		lesson.ID,
		lesson.SectionID,
		lesson.CourseID,
		lesson.Title,
		lesson.Description,
		lesson.VideoURL,
		lesson.YouTubeID,
		lesson.DurationMinutes,
		lesson.OrderIndex,
		lesson.IsPreview,
		lesson.CreatedAt,
		lesson.UpdatedAt,
	)

	return err
}

// GetLessonByID retrieves a lesson by ID
func (r *courseRepository) GetLessonByID(ctx context.Context, id uuid.UUID) (*domain.CourseLesson, error) {
	query := `
		SELECT id, section_id, course_id, title, description,
		       video_url, youtube_id, duration_minutes, order_index, is_preview,
		       created_at, updated_at
		FROM course_lessons
		WHERE id = $1
	`

	lesson := &domain.CourseLesson{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&lesson.ID,
		&lesson.SectionID,
		&lesson.CourseID,
		&lesson.Title,
		&lesson.Description,
		&lesson.VideoURL,
		&lesson.YouTubeID,
		&lesson.DurationMinutes,
		&lesson.OrderIndex,
		&lesson.IsPreview,
		&lesson.CreatedAt,
		&lesson.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrCourseLessonNotFound
	}

	return lesson, err
}

// GetLessonsBySectionID retrieves all lessons for a section
func (r *courseRepository) GetLessonsBySectionID(ctx context.Context, sectionID uuid.UUID) ([]*domain.CourseLesson, error) {
	query := `
		SELECT id, section_id, course_id, title, description,
		       video_url, youtube_id, duration_minutes, order_index, is_preview,
		       created_at, updated_at
		FROM course_lessons
		WHERE section_id = $1
		ORDER BY order_index ASC
	`

	rows, err := r.db.Query(ctx, query, sectionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lessons []*domain.CourseLesson
	for rows.Next() {
		lesson := &domain.CourseLesson{}
		err := rows.Scan(
			&lesson.ID,
			&lesson.SectionID,
			&lesson.CourseID,
			&lesson.Title,
			&lesson.Description,
			&lesson.VideoURL,
			&lesson.YouTubeID,
			&lesson.DurationMinutes,
			&lesson.OrderIndex,
			&lesson.IsPreview,
			&lesson.CreatedAt,
			&lesson.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		lessons = append(lessons, lesson)
	}

	return lessons, rows.Err()
}

// GetLessonsByCourseID retrieves all lessons for a course
func (r *courseRepository) GetLessonsByCourseID(ctx context.Context, courseID uuid.UUID) ([]*domain.CourseLesson, error) {
	query := `
		SELECT id, section_id, course_id, title, description,
		       video_url, youtube_id, duration_minutes, order_index, is_preview,
		       created_at, updated_at
		FROM course_lessons
		WHERE course_id = $1
		ORDER BY order_index ASC
	`

	rows, err := r.db.Query(ctx, query, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lessons []*domain.CourseLesson
	for rows.Next() {
		lesson := &domain.CourseLesson{}
		err := rows.Scan(
			&lesson.ID,
			&lesson.SectionID,
			&lesson.CourseID,
			&lesson.Title,
			&lesson.Description,
			&lesson.VideoURL,
			&lesson.YouTubeID,
			&lesson.DurationMinutes,
			&lesson.OrderIndex,
			&lesson.IsPreview,
			&lesson.CreatedAt,
			&lesson.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		lessons = append(lessons, lesson)
	}

	return lessons, rows.Err()
}

// UpdateLesson updates a course lesson
func (r *courseRepository) UpdateLesson(ctx context.Context, lesson *domain.CourseLesson) error {
	query := `
		UPDATE course_lessons
		SET title = $2, description = $3, video_url = $4, youtube_id = $5,
		    duration_minutes = $6, order_index = $7, is_preview = $8, updated_at = $9
		WHERE id = $1
	`

	lesson.UpdatedAt = time.Now()

	result, err := r.db.Exec(ctx, query,
		lesson.ID,
		lesson.Title,
		lesson.Description,
		lesson.VideoURL,
		lesson.YouTubeID,
		lesson.DurationMinutes,
		lesson.OrderIndex,
		lesson.IsPreview,
		lesson.UpdatedAt,
	)

	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return domain.ErrCourseLessonNotFound
	}

	return nil
}

// DeleteLesson deletes a course lesson
func (r *courseRepository) DeleteLesson(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM course_lessons WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return domain.ErrCourseLessonNotFound
	}

	return nil
}
