package postgres

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/mathvn/backend/internal/domain"
	"github.com/mathvn/backend/internal/repository"
)

// enrollmentRepository implements repository.EnrollmentRepository
type enrollmentRepository struct {
	db *pgxpool.Pool
}

// NewEnrollmentRepository creates a new enrollment repository
func NewEnrollmentRepository(db *pgxpool.Pool) repository.EnrollmentRepository {
	return &enrollmentRepository{db: db}
}

// Create creates a new enrollment
func (r *enrollmentRepository) Create(ctx context.Context, enrollment *domain.Enrollment) error {
	query := `
		INSERT INTO course_enrollments (id, user_id, course_id, activation_code_id, enrolled_at, expires_at, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), $5, $6, NOW(), NOW())
		RETURNING id, enrolled_at, created_at, updated_at
	`

	if enrollment.ID == uuid.Nil {
		enrollment.ID = uuid.New()
	}

	err := r.db.QueryRow(
		ctx,
		query,
		enrollment.ID,
		enrollment.UserID,
		enrollment.CourseID,
		enrollment.ActivationCodeID,
		enrollment.ExpiresAt,
		enrollment.Status,
	).Scan(&enrollment.ID, &enrollment.EnrolledAt, &enrollment.CreatedAt, &enrollment.UpdatedAt)

	return err
}

// GetByID retrieves an enrollment by ID
func (r *enrollmentRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Enrollment, error) {
	query := `
		SELECT id, user_id, course_id, activation_code_id, enrolled_at, expires_at, status, created_at, updated_at
		FROM course_enrollments
		WHERE id = $1
	`

	enrollment := &domain.Enrollment{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&enrollment.ID,
		&enrollment.UserID,
		&enrollment.CourseID,
		&enrollment.ActivationCodeID,
		&enrollment.EnrolledAt,
		&enrollment.ExpiresAt,
		&enrollment.Status,
		&enrollment.CreatedAt,
		&enrollment.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrEnrollmentNotFound
	}
	if err != nil {
		return nil, err
	}

	return enrollment, nil
}

// GetByUserAndCourse retrieves an enrollment by user ID and course ID
func (r *enrollmentRepository) GetByUserAndCourse(ctx context.Context, userID, courseID uuid.UUID) (*domain.Enrollment, error) {
	query := `
		SELECT id, user_id, course_id, activation_code_id, enrolled_at, expires_at, status, created_at, updated_at
		FROM course_enrollments
		WHERE user_id = $1 AND course_id = $2
	`

	enrollment := &domain.Enrollment{}
	err := r.db.QueryRow(ctx, query, userID, courseID).Scan(
		&enrollment.ID,
		&enrollment.UserID,
		&enrollment.CourseID,
		&enrollment.ActivationCodeID,
		&enrollment.EnrolledAt,
		&enrollment.ExpiresAt,
		&enrollment.Status,
		&enrollment.CreatedAt,
		&enrollment.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, domain.ErrEnrollmentNotFound
	}
	if err != nil {
		return nil, err
	}

	return enrollment, nil
}

// GetByUserID retrieves all enrollments for a user
func (r *enrollmentRepository) GetByUserID(ctx context.Context, userID uuid.UUID) ([]*domain.Enrollment, error) {
	query := `
		SELECT id, user_id, course_id, activation_code_id, enrolled_at, expires_at, status, created_at, updated_at
		FROM course_enrollments
		WHERE user_id = $1
		ORDER BY enrolled_at DESC
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var enrollments []*domain.Enrollment
	for rows.Next() {
		enrollment := &domain.Enrollment{}
		err := rows.Scan(
			&enrollment.ID,
			&enrollment.UserID,
			&enrollment.CourseID,
			&enrollment.ActivationCodeID,
			&enrollment.EnrolledAt,
			&enrollment.ExpiresAt,
			&enrollment.Status,
			&enrollment.CreatedAt,
			&enrollment.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		enrollments = append(enrollments, enrollment)
	}

	return enrollments, nil
}

// GetByUserIDWithCourse retrieves all enrollments for a user with course details
func (r *enrollmentRepository) GetByUserIDWithCourse(ctx context.Context, userID uuid.UUID) ([]*domain.Enrollment, error) {
	query := `
		SELECT 
			e.id, e.user_id, e.course_id, e.activation_code_id, e.enrolled_at, e.expires_at, e.status, e.created_at, e.updated_at,
			c.id, c.title, c.slug, c.description, c.short_description, c.image_url, c.price, c.original_price,
			c.rating, c.total_reviews, c.total_students, c.total_lessons, c.duration_minutes, c.level, c.grade, c.status, c.is_featured,
			u.id, u.full_name, u.email
		FROM course_enrollments e
		INNER JOIN courses c ON e.course_id = c.id
		LEFT JOIN users u ON c.instructor_id = u.id
		WHERE e.user_id = $1 AND e.status = 'active'
		ORDER BY e.enrolled_at DESC
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var enrollments []*domain.Enrollment
	for rows.Next() {
		enrollment := &domain.Enrollment{}
		course := &domain.Course{}
		instructor := &domain.User{}

		var courseImageURL, courseShortDesc, courseGrade *string
		var courseOriginalPrice *float64

		err := rows.Scan(
			&enrollment.ID,
			&enrollment.UserID,
			&enrollment.CourseID,
			&enrollment.ActivationCodeID,
			&enrollment.EnrolledAt,
			&enrollment.ExpiresAt,
			&enrollment.Status,
			&enrollment.CreatedAt,
			&enrollment.UpdatedAt,
			&course.ID,
			&course.Title,
			&course.Slug,
			&course.Description,
			&courseShortDesc,
			&courseImageURL,
			&course.Price,
			&courseOriginalPrice,
			&course.Rating,
			&course.TotalReviews,
			&course.TotalStudents,
			&course.TotalLessons,
			&course.DurationMinutes,
			&course.Level,
			&courseGrade,
			&course.Status,
			&course.IsFeatured,
			&instructor.ID,
			&instructor.FullName,
			&instructor.Email,
		)
		if err != nil {
			return nil, err
		}

		if courseImageURL != nil {
			course.ImageURL = courseImageURL
		}
		if courseShortDesc != nil {
			course.ShortDescription = *courseShortDesc
		}
		if courseGrade != nil {
			course.Grade = courseGrade
		}
		if courseOriginalPrice != nil {
			course.OriginalPrice = courseOriginalPrice
		}

		course.Instructor = instructor
		enrollment.Course = course
		enrollments = append(enrollments, enrollment)
	}

	return enrollments, nil
}

// GetByCourseID retrieves all enrollments for a course with pagination
func (r *enrollmentRepository) GetByCourseID(ctx context.Context, courseID uuid.UUID, limit, offset int) ([]*domain.Enrollment, int, error) {
	// Count query
	countQuery := `SELECT COUNT(*) FROM course_enrollments WHERE course_id = $1`
	var total int
	err := r.db.QueryRow(ctx, countQuery, courseID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// List query
	query := `
		SELECT id, user_id, course_id, activation_code_id, enrolled_at, expires_at, status, created_at, updated_at
		FROM course_enrollments
		WHERE course_id = $1
		ORDER BY enrolled_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(ctx, query, courseID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var enrollments []*domain.Enrollment
	for rows.Next() {
		enrollment := &domain.Enrollment{}
		err := rows.Scan(
			&enrollment.ID,
			&enrollment.UserID,
			&enrollment.CourseID,
			&enrollment.ActivationCodeID,
			&enrollment.EnrolledAt,
			&enrollment.ExpiresAt,
			&enrollment.Status,
			&enrollment.CreatedAt,
			&enrollment.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		enrollments = append(enrollments, enrollment)
	}

	return enrollments, total, nil
}

// Update updates an enrollment
func (r *enrollmentRepository) Update(ctx context.Context, enrollment *domain.Enrollment) error {
	query := `
		UPDATE course_enrollments
		SET expires_at = $2, status = $3, updated_at = NOW()
		WHERE id = $1
	`

	result, err := r.db.Exec(ctx, query, enrollment.ID, enrollment.ExpiresAt, enrollment.Status)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return domain.ErrEnrollmentNotFound
	}

	return nil
}

// Delete deletes an enrollment
func (r *enrollmentRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM course_enrollments WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return domain.ErrEnrollmentNotFound
	}

	return nil
}

// IsEnrolled checks if a user is enrolled in a course
func (r *enrollmentRepository) IsEnrolled(ctx context.Context, userID, courseID uuid.UUID) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM course_enrollments 
			WHERE user_id = $1 AND course_id = $2 AND status = 'active'
		)
	`

	var exists bool
	err := r.db.QueryRow(ctx, query, userID, courseID).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}

// CountByUserID returns the number of enrollments for a user
func (r *enrollmentRepository) CountByUserID(ctx context.Context, userID uuid.UUID) (int, error) {
	query := `SELECT COUNT(*) FROM course_enrollments WHERE user_id = $1 AND status = 'active'`

	var count int
	err := r.db.QueryRow(ctx, query, userID).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}

// CountByCourseID returns the number of enrollments for a course
func (r *enrollmentRepository) CountByCourseID(ctx context.Context, courseID uuid.UUID) (int, error) {
	query := `SELECT COUNT(*) FROM course_enrollments WHERE course_id = $1 AND status = 'active'`

	var count int
	err := r.db.QueryRow(ctx, query, courseID).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}
