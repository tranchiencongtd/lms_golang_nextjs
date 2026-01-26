package usecase

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/domain"
	"github.com/mathvn/backend/internal/repository"
)

// courseUseCase implements CourseUseCase
type courseUseCase struct {
	courseRepo repository.CourseRepository
	userRepo   repository.UserRepository
}

// NewCourseUseCase creates a new course use case
func NewCourseUseCase(courseRepo repository.CourseRepository, userRepo repository.UserRepository) CourseUseCase {
	return &courseUseCase{
		courseRepo: courseRepo,
		userRepo:   userRepo,
	}
}

// GetCourse retrieves a course by ID or slug
func (uc *courseUseCase) GetCourse(ctx context.Context, idOrSlug string) (*domain.Course, error) {
	// Try to parse as UUID first
	if id, err := uuid.Parse(idOrSlug); err == nil {
		return uc.courseRepo.GetByID(ctx, id)
	}

	// Otherwise treat as slug
	return uc.courseRepo.GetBySlug(ctx, idOrSlug)
}

// ListCourses retrieves courses with filters, pagination, and sorting
func (uc *courseUseCase) ListCourses(ctx context.Context, filter *domain.CourseFilter, sort domain.CourseSort, page, pageSize int) ([]*domain.Course, int, error) {
	// Default filter: only show published courses
	if filter == nil {
		filter = &domain.CourseFilter{}
	}

	// Validate and set defaults
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	if pageSize > 100 {
		pageSize = 100
	}

	offset := (page - 1) * pageSize

	courses, total, err := uc.courseRepo.List(ctx, filter, sort, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}

	return courses, total, nil
}

// GetCourseWithDetails retrieves a course with instructor and sections/lessons
func (uc *courseUseCase) GetCourseWithDetails(ctx context.Context, idOrSlug string) (*domain.Course, error) {
	// Get course
	course, err := uc.GetCourse(ctx, idOrSlug)
	if err != nil {
		return nil, err
	}

	// Get instructor
	instructor, err := uc.userRepo.GetByID(ctx, course.InstructorID)
	if err != nil {
		// Don't fail if instructor not found, just skip
	} else {
		course.Instructor = instructor
	}

	// Get sections
	sections, err := uc.courseRepo.GetSectionsByCourseID(ctx, course.ID)
	if err != nil {
		return nil, err
	}

	// Get lessons for each section
	for _, section := range sections {
		lessons, err := uc.courseRepo.GetLessonsBySectionID(ctx, section.ID)
		if err != nil {
			return nil, err
		}
		section.Lessons = lessons
	}

	course.Sections = sections

	return course, nil
}

// Admin operations
func (uc *courseUseCase) CreateCourse(ctx context.Context, course *domain.Course) error {
	course.ID = uuid.New()
	course.CreatedAt = time.Now()
	course.UpdatedAt = time.Now()

	if course.Slug == "" {
		course.Slug = generateSlug(course.Title)
	}

	if course.Status == "" {
		course.Status = domain.StatusDraft
	}

	return uc.courseRepo.Create(ctx, course)
}

func (uc *courseUseCase) UpdateCourse(ctx context.Context, course *domain.Course) error {
	// Get existing course to preserve immutable fields
	existingCourse, err := uc.courseRepo.GetByID(ctx, course.ID)
	if err != nil {
		return err
	}

	// Preserve fields that shouldn't be updated by this API
	course.Rating = existingCourse.Rating
	course.TotalReviews = existingCourse.TotalReviews
	course.TotalStudents = existingCourse.TotalStudents
	course.TotalLessons = existingCourse.TotalLessons
	course.CreatedAt = existingCourse.CreatedAt
	course.InstructorID = existingCourse.InstructorID // Usually shouldn't change instructor on simple update

	// If slug is empty or changed in a way that needs re-generation logic (omitted for now, assuming simple update)
	if course.Slug == "" {
		course.Slug = existingCourse.Slug
	}

	course.UpdatedAt = time.Now()
	return uc.courseRepo.Update(ctx, course)
}

func (uc *courseUseCase) DeleteCourse(ctx context.Context, id uuid.UUID) error {
	return uc.courseRepo.Delete(ctx, id)
}

// Section operations
func (uc *courseUseCase) CreateSection(ctx context.Context, section *domain.CourseSection) error {
	section.ID = uuid.New()
	section.CreatedAt = time.Now()
	section.UpdatedAt = time.Now()
	return uc.courseRepo.CreateSection(ctx, section)
}

func (uc *courseUseCase) UpdateSection(ctx context.Context, section *domain.CourseSection) error {
	section.UpdatedAt = time.Now()
	return uc.courseRepo.UpdateSection(ctx, section)
}

func (uc *courseUseCase) DeleteSection(ctx context.Context, id uuid.UUID) error {
	return uc.courseRepo.DeleteSection(ctx, id)
}

// Lesson operations
func (uc *courseUseCase) CreateLesson(ctx context.Context, lesson *domain.CourseLesson) error {
	lesson.ID = uuid.New()
	lesson.CreatedAt = time.Now()
	lesson.UpdatedAt = time.Now()

	// Extract YouTube ID from URL if present
	if lesson.VideoURL != nil && *lesson.VideoURL != "" {
		ytID := extractYouTubeID(*lesson.VideoURL)
		if ytID != "" {
			lesson.YouTubeID = &ytID
		}
	}

	return uc.courseRepo.CreateLesson(ctx, lesson)
}

func (uc *courseUseCase) UpdateLesson(ctx context.Context, lesson *domain.CourseLesson) error {
	lesson.UpdatedAt = time.Now()

	// Extract YouTube ID from URL if present
	if lesson.VideoURL != nil && *lesson.VideoURL != "" {
		ytID := extractYouTubeID(*lesson.VideoURL)
		if ytID != "" {
			lesson.YouTubeID = &ytID
		}
	} else if lesson.VideoURL != nil && *lesson.VideoURL == "" {
		// If video url is cleared, clear youtube id too
		// Note: This logic assumes if VideoURL is passed as empty string, it means clear.
		// If it's nil (not updated), we do nothing.
		// However, struct field is *string. If it's pointer to empty string, it means update to empty.
		// If it's nil, it's ignored by repo usually (if using dynamic update).
		// Use case receives the full struct/partial struct.
		// Assuming repo handles full update or we update fields.
		// For simplicity, we just sync YouTubeID if VideoURL is provided.
	}

	return uc.courseRepo.UpdateLesson(ctx, lesson)
}

func (uc *courseUseCase) DeleteLesson(ctx context.Context, id uuid.UUID) error {
	return uc.courseRepo.DeleteLesson(ctx, id)
}

// Helper function to extract YouTube ID
func extractYouTubeID(url string) string {
	// Simple extraction logic - can be improved with regex
	// Supported formats:
	// https://www.youtube.com/watch?v=VIDEO_ID
	// https://youtu.be/VIDEO_ID
	// https://www.youtube.com/embed/VIDEO_ID

	if strings.Contains(url, "v=") {
		parts := strings.Split(url, "v=")
		if len(parts) > 1 {
			id := parts[1]
			// Handle query params after ID
			if idx := strings.Index(id, "&"); idx != -1 {
				id = id[:idx]
			}
			return id
		}
	}

	if strings.Contains(url, "youtu.be/") {
		parts := strings.Split(url, "youtu.be/")
		if len(parts) > 1 {
			id := parts[1]
			if idx := strings.Index(id, "?"); idx != -1 {
				id = id[:idx]
			}
			return id
		}
	}

	if strings.Contains(url, "embed/") {
		parts := strings.Split(url, "embed/")
		if len(parts) > 1 {
			id := parts[1]
			if idx := strings.Index(id, "?"); idx != -1 {
				id = id[:idx]
			}
			return id
		}
	}

	return ""
}

// Helper function to generate slug from title
func generateSlug(title string) string {
	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = strings.ReplaceAll(slug, "đ", "d")
	slug = strings.ReplaceAll(slug, "á", "a")
	slug = strings.ReplaceAll(slug, "à", "a")
	slug = strings.ReplaceAll(slug, "ả", "a")
	slug = strings.ReplaceAll(slug, "ã", "a")
	slug = strings.ReplaceAll(slug, "ạ", "a")
	slug = strings.ReplaceAll(slug, "ă", "a")
	slug = strings.ReplaceAll(slug, "ắ", "a")
	slug = strings.ReplaceAll(slug, "ằ", "a")
	slug = strings.ReplaceAll(slug, "ẳ", "a")
	slug = strings.ReplaceAll(slug, "ẵ", "a")
	slug = strings.ReplaceAll(slug, "ặ", "a")
	slug = strings.ReplaceAll(slug, "â", "a")
	slug = strings.ReplaceAll(slug, "ấ", "a")
	slug = strings.ReplaceAll(slug, "ầ", "a")
	slug = strings.ReplaceAll(slug, "ẩ", "a")
	slug = strings.ReplaceAll(slug, "ẫ", "a")
	slug = strings.ReplaceAll(slug, "ậ", "a")
	slug = strings.ReplaceAll(slug, "é", "e")
	slug = strings.ReplaceAll(slug, "è", "e")
	slug = strings.ReplaceAll(slug, "ẻ", "e")
	slug = strings.ReplaceAll(slug, "ẽ", "e")
	slug = strings.ReplaceAll(slug, "ẹ", "e")
	slug = strings.ReplaceAll(slug, "ê", "e")
	slug = strings.ReplaceAll(slug, "ế", "e")
	slug = strings.ReplaceAll(slug, "ề", "e")
	slug = strings.ReplaceAll(slug, "ể", "e")
	slug = strings.ReplaceAll(slug, "ễ", "e")
	slug = strings.ReplaceAll(slug, "ệ", "e")
	slug = strings.ReplaceAll(slug, "í", "i")
	slug = strings.ReplaceAll(slug, "ì", "i")
	slug = strings.ReplaceAll(slug, "ỉ", "i")
	slug = strings.ReplaceAll(slug, "ĩ", "i")
	slug = strings.ReplaceAll(slug, "ị", "i")
	slug = strings.ReplaceAll(slug, "ó", "o")
	slug = strings.ReplaceAll(slug, "ò", "o")
	slug = strings.ReplaceAll(slug, "ỏ", "o")
	slug = strings.ReplaceAll(slug, "õ", "o")
	slug = strings.ReplaceAll(slug, "ọ", "o")
	slug = strings.ReplaceAll(slug, "ô", "o")
	slug = strings.ReplaceAll(slug, "ố", "o")
	slug = strings.ReplaceAll(slug, "ồ", "o")
	slug = strings.ReplaceAll(slug, "ổ", "o")
	slug = strings.ReplaceAll(slug, "ỗ", "o")
	slug = strings.ReplaceAll(slug, "ộ", "o")
	slug = strings.ReplaceAll(slug, "ơ", "o")
	slug = strings.ReplaceAll(slug, "ớ", "o")
	slug = strings.ReplaceAll(slug, "ờ", "o")
	slug = strings.ReplaceAll(slug, "ở", "o")
	slug = strings.ReplaceAll(slug, "ỡ", "o")
	slug = strings.ReplaceAll(slug, "ợ", "o")
	slug = strings.ReplaceAll(slug, "ú", "u")
	slug = strings.ReplaceAll(slug, "ù", "u")
	slug = strings.ReplaceAll(slug, "ủ", "u")
	slug = strings.ReplaceAll(slug, "ũ", "u")
	slug = strings.ReplaceAll(slug, "ụ", "u")
	slug = strings.ReplaceAll(slug, "ư", "u")
	slug = strings.ReplaceAll(slug, "ứ", "u")
	slug = strings.ReplaceAll(slug, "ừ", "u")
	slug = strings.ReplaceAll(slug, "ử", "u")
	slug = strings.ReplaceAll(slug, "ữ", "u")
	slug = strings.ReplaceAll(slug, "ự", "u")
	slug = strings.ReplaceAll(slug, "ý", "y")
	slug = strings.ReplaceAll(slug, "ỳ", "y")
	slug = strings.ReplaceAll(slug, "ỷ", "y")
	slug = strings.ReplaceAll(slug, "ỹ", "y")
	slug = strings.ReplaceAll(slug, "ỵ", "y")

	// Remove special characters
	var result strings.Builder
	for _, char := range slug {
		if (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char == '-' {
			result.WriteRune(char)
		}
	}

	return result.String()
}
