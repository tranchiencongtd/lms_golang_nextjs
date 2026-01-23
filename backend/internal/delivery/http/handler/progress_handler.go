package handler

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/delivery/http/response"
	"github.com/mathvn/backend/internal/domain"
	"github.com/mathvn/backend/internal/usecase"
)

// ProgressHandler handles progress-related HTTP requests
type ProgressHandler struct {
	progressUseCase usecase.ProgressUseCase
}

// NewProgressHandler creates a new progress handler
func NewProgressHandler(progressUseCase usecase.ProgressUseCase) *ProgressHandler {
	return &ProgressHandler{
		progressUseCase: progressUseCase,
	}
}

// GetCourseProgress returns the user's progress in a course
// @Summary Get course progress
// @Description Get the current user's progress in a specific course
// @Tags progress
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param courseId path string true "Course ID"
// @Success 200 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/progress/{courseId} [get]
func (h *ProgressHandler) GetCourseProgress(c *gin.Context) {
	// Get user ID from context
	userIDValue, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "Chưa xác thực")
		return
	}

	userID, ok := userIDValue.(uuid.UUID)
	if !ok {
		response.Unauthorized(c, "Token không hợp lệ")
		return
	}

	// Get course ID from URL
	courseIDStr := c.Param("courseId")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		response.BadRequest(c, "Course ID không hợp lệ")
		return
	}

	// Get progress
	progress, err := h.progressUseCase.GetCourseProgress(c.Request.Context(), userID, courseID)
	if err != nil {
		h.handleProgressError(c, err)
		return
	}

	response.OK(c, "Lấy tiến độ học thành công", progress)
}

// MarkLessonCompleted marks a lesson as completed
// @Summary Mark lesson as completed
// @Description Mark a specific lesson as completed for the current user
// @Tags progress
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param courseId path string true "Course ID"
// @Param lessonId path string true "Lesson ID"
// @Success 200 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/progress/{courseId}/lessons/{lessonId}/complete [post]
func (h *ProgressHandler) MarkLessonCompleted(c *gin.Context) {
	// Get user ID from context
	userIDValue, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "Chưa xác thực")
		return
	}

	userID, ok := userIDValue.(uuid.UUID)
	if !ok {
		response.Unauthorized(c, "Token không hợp lệ")
		return
	}

	// Get course ID and lesson ID from URL
	courseIDStr := c.Param("courseId")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		response.BadRequest(c, "Course ID không hợp lệ")
		return
	}

	lessonIDStr := c.Param("lessonId")
	lessonID, err := uuid.Parse(lessonIDStr)
	if err != nil {
		response.BadRequest(c, "Lesson ID không hợp lệ")
		return
	}

	// Mark as completed
	err = h.progressUseCase.MarkLessonCompleted(c.Request.Context(), userID, courseID, lessonID)
	if err != nil {
		h.handleProgressError(c, err)
		return
	}

	response.OK(c, "Đã hoàn thành bài học", gin.H{
		"lesson_id": lessonID,
	})
}

// UpdateWatchProgressRequest represents the request body for updating watch progress
type UpdateWatchProgressRequest struct {
	DurationSeconds int `json:"duration_seconds" binding:"required,min=0"`
}

// UpdateWatchProgress updates the watch progress for a lesson
// @Summary Update watch progress
// @Description Update the watch progress (time watched) for a specific lesson
// @Tags progress
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param courseId path string true "Course ID"
// @Param lessonId path string true "Lesson ID"
// @Param input body UpdateWatchProgressRequest true "Watch progress input"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Router /api/v1/progress/{courseId}/lessons/{lessonId}/watch [post]
func (h *ProgressHandler) UpdateWatchProgress(c *gin.Context) {
	// Get user ID from context
	userIDValue, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "Chưa xác thực")
		return
	}

	userID, ok := userIDValue.(uuid.UUID)
	if !ok {
		response.Unauthorized(c, "Token không hợp lệ")
		return
	}

	// Get course ID and lesson ID from URL
	courseIDStr := c.Param("courseId")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		response.BadRequest(c, "Course ID không hợp lệ")
		return
	}

	lessonIDStr := c.Param("lessonId")
	lessonID, err := uuid.Parse(lessonIDStr)
	if err != nil {
		response.BadRequest(c, "Lesson ID không hợp lệ")
		return
	}

	// Parse request body
	var req UpdateWatchProgressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Dữ liệu không hợp lệ: "+err.Error())
		return
	}

	// Update progress
	err = h.progressUseCase.UpdateWatchProgress(c.Request.Context(), userID, courseID, lessonID, req.DurationSeconds)
	if err != nil {
		h.handleProgressError(c, err)
		return
	}

	response.OK(c, "Cập nhật tiến độ xem thành công", gin.H{
		"lesson_id":        lessonID,
		"duration_seconds": req.DurationSeconds,
	})
}

// UpdateLastLesson updates the last lesson the user was watching
// @Summary Update last lesson
// @Description Update the last lesson the user was watching in a course
// @Tags progress
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param courseId path string true "Course ID"
// @Param lessonId path string true "Lesson ID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Router /api/v1/progress/{courseId}/last-lesson/{lessonId} [post]
func (h *ProgressHandler) UpdateLastLesson(c *gin.Context) {
	// Get user ID from context
	userIDValue, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "Chưa xác thực")
		return
	}

	userID, ok := userIDValue.(uuid.UUID)
	if !ok {
		response.Unauthorized(c, "Token không hợp lệ")
		return
	}

	// Get course ID and lesson ID from URL
	courseIDStr := c.Param("courseId")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		response.BadRequest(c, "Course ID không hợp lệ")
		return
	}

	lessonIDStr := c.Param("lessonId")
	lessonID, err := uuid.Parse(lessonIDStr)
	if err != nil {
		response.BadRequest(c, "Lesson ID không hợp lệ")
		return
	}

	// Update last lesson
	err = h.progressUseCase.UpdateLastLesson(c.Request.Context(), userID, courseID, lessonID)
	if err != nil {
		h.handleProgressError(c, err)
		return
	}

	response.OK(c, "Cập nhật bài học gần nhất thành công", gin.H{
		"lesson_id": lessonID,
	})
}

// handleProgressError handles progress-related errors
func (h *ProgressHandler) handleProgressError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, domain.ErrEnrollmentNotFound):
		response.NotFound(c, "Bạn chưa đăng ký khoá học này")
	case errors.Is(err, domain.ErrEnrollmentExpired):
		response.Forbidden(c, "Đăng ký khoá học đã hết hạn")
	case errors.Is(err, domain.ErrLessonProgressNotFound):
		response.NotFound(c, "Không tìm thấy tiến độ bài học")
	default:
		response.InternalServerError(c, "Đã xảy ra lỗi hệ thống")
	}
}
