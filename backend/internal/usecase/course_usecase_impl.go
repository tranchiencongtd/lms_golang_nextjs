package usecase

import (
	"context"
	"strings"
	"unicode/utf8"

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
	if filter.Status == nil {
		published := domain.StatusPublished
		filter.Status = &published
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

// ListTaxonomies returns distinct grade/topic/level options with display names
func (uc *courseUseCase) ListTaxonomies(ctx context.Context) (*domain.CourseTaxonomies, error) {
	data, err := uc.courseRepo.ListTaxonomies(ctx)
	if err != nil {
		return nil, err
	}

	for i := range data.Grades {
		data.Grades[i].Name = gradeDisplayName(data.Grades[i].ID)
	}
	for i := range data.Topics {
		data.Topics[i].Name = topicDisplayName(data.Topics[i].ID)
	}
	for i := range data.Levels {
		data.Levels[i].Name = levelDisplayName(data.Levels[i].ID)
	}

	return data, nil
}

func gradeDisplayName(code string) string {
	switch strings.TrimSpace(code) {
	case "6":
		return "Lớp 6"
	case "7":
		return "Lớp 7"
	case "8":
		return "Lớp 8"
	case "9":
		return "Lớp 9"
	case "10":
		return "Lớp 10"
	case "11":
		return "Lớp 11"
	case "12":
		return "Lớp 12"
	case "thpt":
		return "THPT"
	default:
		return "Lớp " + code
	}
}

func topicDisplayName(code string) string {
	switch strings.TrimSpace(code) {
	case "dai-so":
		return "Đại số"
	case "hinh-hoc":
		return "Hình học"
	case "luyen-thi-thpt":
		return "Luyện thi THPT"
	default:
		return humanizeSlug(code)
	}
}

func levelDisplayName(code string) string {
	switch domain.CourseLevel(strings.TrimSpace(code)) {
	case domain.LevelBasic:
		return "Cơ bản"
	case domain.LevelIntermediate:
		return "Nâng cao"
	case domain.LevelAdvanced:
		return "Chuyên sâu"
	default:
		return humanizeSlug(code)
	}
}

func humanizeSlug(slug string) string {
	if slug == "" {
		return ""
	}
	slug = strings.ReplaceAll(slug, "-", " ")
	slug = strings.ReplaceAll(slug, "_", " ")
	parts := strings.Fields(slug)
	for i, p := range parts {
		parts[i] = capitalizeWord(p)
	}
	return strings.Join(parts, " ")
}

func capitalizeWord(word string) string {
	if word == "" {
		return ""
	}
	first, size := utf8.DecodeRuneInString(word)
	if first == utf8.RuneError {
		return strings.Title(word)
	}
	return strings.ToUpper(string(first)) + strings.ToLower(word[size:])
}
