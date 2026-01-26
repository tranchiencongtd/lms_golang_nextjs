package handler

import (
	"errors"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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
	} else {
		published := domain.StatusPublished
		filter.Status = &published
	}

	if levelStr := c.Query("level"); levelStr != "" {
		levels := strings.Split(levelStr, ",")
		for _, lv := range levels {
			trimmed := strings.TrimSpace(lv)
			if trimmed != "" {
				filter.Levels = append(filter.Levels, domain.CourseLevel(trimmed))
			}
		}
	}

	if grade := c.Query("grade"); grade != "" {
		grades := strings.Split(grade, ",")
		for _, g := range grades {
			trimmed := strings.TrimSpace(g)
			if trimmed != "" {
				filter.Grades = append(filter.Grades, trimmed)
			}
		}
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
		"items": courses,
		"pagination": gin.H{
			"page":        page,
			"page_size":   pageSize,
			"total":       total,
			"total_pages": (total + pageSize - 1) / pageSize,
		},
	})
}

// Admin handlers

// CreateCourse handles creating a new course
// @Summary Create course
// @Tags admin/courses
// @Accept json
// @Produce json
// @Param body body domain.Course true "Course data"
// @Success 201 {object} response.Response
// @Router /api/v1/admin/courses [post]
func (h *CourseHandler) CreateCourse(c *gin.Context) {
	var req domain.Course
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Dữ liệu không hợp lệ")
		return
	}

	// Get instructorID from auth context
	if userID, exists := c.Get("userID"); exists {
		req.InstructorID = userID.(uuid.UUID)
	}

	// Set default short description if empty
	if req.ShortDescription == "" && req.Description != "" {
		if len(req.Description) > 150 {
			req.ShortDescription = req.Description[:150] + "..."
		} else {
			req.ShortDescription = req.Description
		}
	}

	// Set default empty string for optional fields that are NOT NULL in DB
	if req.Grade == nil {
		empty := ""
		req.Grade = &empty
	}
	if req.WhatYouLearn == nil {
		empty := ""
		req.WhatYouLearn = &empty
	}
	if req.Requirements == nil {
		empty := ""
		req.Requirements = &empty
	}

	err := h.courseUseCase.CreateCourse(c.Request.Context(), &req)
	if err != nil {
		// h.handleCourseError(c, err)
		// Return detailed error for debugging
		response.InternalServerError(c, "Lỗi tạo khóa học: "+err.Error())
		return
	}

	response.Created(c, "Tạo khóa học thành công", req)
}

// UpdateCourse handles updating a course
// @Summary Update course
// @Tags admin/courses
// @Accept json
// @Produce json
// @Param id path string true "Course ID"
// @Param body body domain.Course true "Course data"
// @Success 200 {object} response.Response
// @Router /api/v1/admin/courses/{id} [put]
func (h *CourseHandler) UpdateCourse(c *gin.Context) {
	// Parse ID from path
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "ID khóa học không hợp lệ")
		return
	}

	var req domain.Course
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Dữ liệu không hợp lệ")
		return
	}
	req.ID = id

	err = h.courseUseCase.UpdateCourse(c.Request.Context(), &req)
	if err != nil {
		h.handleCourseError(c, err)
		return
	}

	response.OK(c, "Cập nhật khóa học thành công", req)
}

// DeleteCourse handles deleting a course
// @Summary Delete course
// @Tags admin/courses
// @Param id path string true "Course ID"
// @Success 200 {object} response.Response
// @Router /api/v1/admin/courses/{id} [delete]
func (h *CourseHandler) DeleteCourse(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "ID khóa học không hợp lệ")
		return
	}

	err = h.courseUseCase.DeleteCourse(c.Request.Context(), id)
	if err != nil {
		h.handleCourseError(c, err)
		return
	}

	response.OK(c, "Xóa khóa học thành công", nil)
}

// ListAdminCourses handles listing courses for admin
func (h *CourseHandler) ListAdminCourses(c *gin.Context) {
	filter := &domain.CourseFilter{}

	if statusStr := c.Query("status"); statusStr != "" {
		status := domain.CourseStatus(statusStr)
		filter.Status = &status
	}
	// No default status for admin

	if levelStr := c.Query("level"); levelStr != "" {
		levels := strings.Split(levelStr, ",")
		for _, lv := range levels {
			trimmed := strings.TrimSpace(lv)
			if trimmed != "" {
				filter.Levels = append(filter.Levels, domain.CourseLevel(trimmed))
			}
		}
	}

	if grade := c.Query("grade"); grade != "" {
		grades := strings.Split(grade, ",")
		for _, g := range grades {
			trimmed := strings.TrimSpace(g)
			if trimmed != "" {
				filter.Grades = append(filter.Grades, trimmed)
			}
		}
	}

	if search := c.Query("search"); search != "" {
		filter.Search = &search
	}

	if featuredStr := c.Query("featured"); featuredStr != "" {
		featured := featuredStr == "true"
		filter.IsFeatured = &featured
	}

	sort := domain.SortCreatedAtDesc
	if sortStr := c.Query("sort"); sortStr != "" {
		sort = domain.CourseSort(sortStr)
	}

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
		"items": courses,
		"pagination": gin.H{
			"page":        page,
			"page_size":   pageSize,
			"total":       total,
			"total_pages": (total + pageSize - 1) / pageSize,
		},
	})
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
