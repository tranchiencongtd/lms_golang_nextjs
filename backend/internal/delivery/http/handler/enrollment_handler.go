package handler

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/delivery/http/response"
	"github.com/mathvn/backend/internal/domain"
	"github.com/mathvn/backend/internal/usecase"
)

// EnrollmentHandler handles enrollment-related HTTP requests
type EnrollmentHandler struct {
	enrollmentUseCase usecase.EnrollmentUseCase
}

// NewEnrollmentHandler creates a new enrollment handler
func NewEnrollmentHandler(enrollmentUseCase usecase.EnrollmentUseCase) *EnrollmentHandler {
	return &EnrollmentHandler{
		enrollmentUseCase: enrollmentUseCase,
	}
}

// ActivateCourse handles course activation with an activation code
// @Summary Activate a course with code
// @Description Redeem an activation code to enroll in a course
// @Tags enrollments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param input body usecase.ActivateCourseInput true "Activation code input"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 409 {object} response.Response
// @Router /api/v1/enrollments/activate [post]
func (h *EnrollmentHandler) ActivateCourse(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
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

	var input usecase.ActivateCourseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "Dữ liệu không hợp lệ: "+err.Error())
		return
	}

	result, err := h.enrollmentUseCase.ActivateCourse(c.Request.Context(), userID, &input)
	if err != nil {
		h.handleEnrollmentError(c, err)
		return
	}

	response.OK(c, "Kích hoạt khoá học thành công", gin.H{
		"enrollment": result.Enrollment,
		"course":     result.Course,
	})
}

// GetMyCourses handles getting the current user's enrolled courses
// @Summary Get my enrolled courses
// @Description Get all courses that the current user is enrolled in
// @Tags enrollments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response
// @Failure 401 {object} response.Response
// @Router /api/v1/enrollments/my-courses [get]
func (h *EnrollmentHandler) GetMyCourses(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
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

	enrollments, err := h.enrollmentUseCase.GetUserEnrollments(c.Request.Context(), userID)
	if err != nil {
		h.handleEnrollmentError(c, err)
		return
	}

	response.OK(c, "Lấy danh sách khoá học thành công", gin.H{
		"enrollments": enrollments,
		"total":       len(enrollments),
	})
}

// CheckEnrollment handles checking if user is enrolled in a course
// @Summary Check enrollment status
// @Description Check if the current user is enrolled in a specific course
// @Tags enrollments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param courseId path string true "Course ID"
// @Success 200 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 400 {object} response.Response
// @Router /api/v1/enrollments/check/{courseId} [get]
func (h *EnrollmentHandler) CheckEnrollment(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
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

	courseIDStr := c.Param("courseId")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		response.BadRequest(c, "Course ID không hợp lệ")
		return
	}

	isEnrolled, err := h.enrollmentUseCase.IsEnrolled(c.Request.Context(), userID, courseID)
	if err != nil {
		h.handleEnrollmentError(c, err)
		return
	}

	response.OK(c, "Kiểm tra đăng ký thành công", gin.H{
		"is_enrolled": isEnrolled,
		"course_id":   courseID,
	})
}

// CreateActivationCode handles creating a new activation code (admin only)
// @Summary Create activation code
// @Description Create a new activation code for a course (admin only)
// @Tags enrollments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param input body usecase.CreateActivationCodeInput true "Activation code creation input"
// @Success 201 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Router /api/v1/enrollments/activation-codes [post]
func (h *EnrollmentHandler) CreateActivationCode(c *gin.Context) {
	// Get user ID and role from context (set by auth middleware)
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

	// Check if user is admin
	roleValue, exists := c.Get("userRole")
	if !exists {
		response.Forbidden(c, "Không có quyền truy cập")
		return
	}

	role, ok := roleValue.(domain.UserRole)
	if !ok || role != domain.RoleAdmin {
		response.Forbidden(c, "Chỉ admin mới có quyền tạo mã kích hoạt")
		return
	}

	var input usecase.CreateActivationCodeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "Dữ liệu không hợp lệ: "+err.Error())
		return
	}

	result, err := h.enrollmentUseCase.CreateActivationCode(c.Request.Context(), userID, &input)
	if err != nil {
		h.handleEnrollmentError(c, err)
		return
	}

	response.Created(c, "Tạo mã kích hoạt thành công", result.ActivationCode)
}

// handleEnrollmentError handles enrollment-related errors
func (h *EnrollmentHandler) handleEnrollmentError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, domain.ErrActivationCodeNotFound):
		response.NotFound(c, "Mã kích hoạt không tồn tại")
	case errors.Is(err, domain.ErrActivationCodeExpired):
		response.BadRequest(c, "Mã kích hoạt đã hết hạn")
	case errors.Is(err, domain.ErrActivationCodeUsedUp):
		response.BadRequest(c, "Mã kích hoạt đã được sử dụng hết")
	case errors.Is(err, domain.ErrActivationCodeInactive):
		response.BadRequest(c, "Mã kích hoạt đã bị vô hiệu hoá")
	case errors.Is(err, domain.ErrActivationCodeInvalid):
		response.BadRequest(c, "Mã kích hoạt không hợp lệ")
	case errors.Is(err, domain.ErrAlreadyEnrolled):
		response.Conflict(c, "Bạn đã đăng ký khoá học này rồi")
	case errors.Is(err, domain.ErrEnrollmentNotFound):
		response.NotFound(c, "Không tìm thấy đăng ký")
	case errors.Is(err, domain.ErrCourseNotFound):
		response.NotFound(c, "Không tìm thấy khoá học")
	default:
		response.InternalServerError(c, "Đã xảy ra lỗi hệ thống")
	}
}
