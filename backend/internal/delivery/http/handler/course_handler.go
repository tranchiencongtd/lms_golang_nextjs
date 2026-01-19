package handler

import (
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/mathvn/backend/internal/delivery/http/response"
	"github.com/mathvn/backend/internal/domain"
	"github.com/mathvn/backend/internal/usecase"
)

// CourseHandler handles course-related HTTP requests
type CourseHandler struct {
	courseUseCase usecase.CourseUseCase
}

// NewCourseHandler creates a new course handler
func NewCourseHandler(courseUseCase usecase.CourseUseCase) *CourseHandler {
	return &CourseHandler{
		courseUseCase: courseUseCase,
	}
}

// GetCourse handles getting a course by ID or slug
// @Summary Get course by ID or slug
// @Description Get a course with its details
// @Tags courses
// @Accept json
// @Produce json
// @Param id path string true "Course ID or slug"
// @Success 200 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/courses/{id} [get]
func (h *CourseHandler) GetCourse(c *gin.Context) {
	idOrSlug := c.Param("id")

	// Check if details query param is present
	includeDetails := c.Query("details") == "true"

	var course *domain.Course
	var err error

	if includeDetails {
		course, err = h.courseUseCase.GetCourseWithDetails(c.Request.Context(), idOrSlug)
	} else {
		course, err = h.courseUseCase.GetCourse(c.Request.Context(), idOrSlug)
	}

	if err != nil {
		h.handleCourseError(c, err)
		return
	}

	response.OK(c, "Lấy thông tin khóa học thành công", course)
}

// ListCourses handles listing courses with filters
// @Summary List courses
// @Description Get a list of courses with filters, pagination, and sorting
// @Tags courses
// @Accept json
// @Produce json
// @Param status query string false "Course status (draft, published, archived)"
// @Param level query string false "Course level (basic, intermediate, advanced)"
// @Param grade query string false "Grade filter"
// @Param topic query string false "Topic filter"
// @Param search query string false "Search query"
// @Param featured query boolean false "Featured courses only"
// @Param sort query string false "Sort by (created_at_desc, created_at_asc, price_asc, price_desc, rating_desc, students_desc)"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} response.Response
// @Router /api/v1/courses [get]
func (h *CourseHandler) ListCourses(c *gin.Context) {
	// Parse query parameters
	filter := &domain.CourseFilter{}

	if statusStr := c.Query("status"); statusStr != "" {
		status := domain.CourseStatus(statusStr)
		filter.Status = &status
	}

	if levelStr := c.Query("level"); levelStr != "" {
		level := domain.CourseLevel(levelStr)
		filter.Level = &level
	}

	if grade := c.Query("grade"); grade != "" {
		filter.Grade = &grade
	}

	if topic := c.Query("topic"); topic != "" {
		filter.Topic = &topic
	}

	if search := c.Query("search"); search != "" {
		filter.Search = &search
	}

	if featuredStr := c.Query("featured"); featuredStr != "" {
		featured := featuredStr == "true"
		filter.IsFeatured = &featured
	}

	// Parse sort
	sort := domain.SortCreatedAtDesc
	if sortStr := c.Query("sort"); sortStr != "" {
		sort = domain.CourseSort(sortStr)
	}

	// Parse pagination
	page := 1
	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	pageSize := 20
	if pageSizeStr := c.Query("page_size"); pageSizeStr != "" {
		if ps, err := strconv.Atoi(pageSizeStr); err == nil && ps > 0 {
			pageSize = ps
		}
	}

	courses, total, err := h.courseUseCase.ListCourses(c.Request.Context(), filter, sort, page, pageSize)
	if err != nil {
		h.handleCourseError(c, err)
		return
	}

	response.OK(c, "Lấy danh sách khóa học thành công", gin.H{
		"courses": courses,
		"pagination": gin.H{
			"page":        page,
			"page_size":   pageSize,
			"total":       total,
			"total_pages": (total + pageSize - 1) / pageSize,
		},
	})
}

// ListCourseFilters handles retrieving available grade/topic/level options
// @Summary Get course filter options
// @Description Returns distinct grades, topics and levels for courses
// @Tags courses
// @Produce json
// @Success 200 {object} response.Response
// @Router /api/v1/courses/filters [get]
func (h *CourseHandler) ListCourseFilters(c *gin.Context) {
	taxonomies, err := h.courseUseCase.ListTaxonomies(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Không thể tải bộ lọc khóa học")
		return
	}

	response.OK(c, "Lấy bộ lọc khóa học thành công", taxonomies)
}

// handleCourseError handles course-related errors
func (h *CourseHandler) handleCourseError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, domain.ErrCourseNotFound):
		response.NotFound(c, "Không tìm thấy khóa học")
	case errors.Is(err, domain.ErrCourseSectionNotFound):
		response.NotFound(c, "Không tìm thấy chương học")
	case errors.Is(err, domain.ErrCourseLessonNotFound):
		response.NotFound(c, "Không tìm thấy bài học")
	default:
		response.InternalServerError(c, "Đã xảy ra lỗi hệ thống")
	}
}
