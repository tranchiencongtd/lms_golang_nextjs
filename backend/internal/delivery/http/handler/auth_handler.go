package handler

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/delivery/http/response"
	"github.com/mathvn/backend/internal/domain"
	"github.com/mathvn/backend/internal/usecase"
)

// AuthHandler handles authentication-related HTTP requests
type AuthHandler struct {
	authUseCase usecase.AuthUseCase
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(authUseCase usecase.AuthUseCase) *AuthHandler {
	return &AuthHandler{
		authUseCase: authUseCase,
	}
}

// Register handles user registration
// @Summary Register a new user
// @Description Register a new user with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param input body usecase.RegisterInput true "Registration input"
// @Success 201 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 409 {object} response.Response
// @Router /api/v1/auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var input usecase.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "Dữ liệu không hợp lệ: "+err.Error())
		return
	}

	result, err := h.authUseCase.Register(c.Request.Context(), &input)
	if err != nil {
		h.handleAuthError(c, err)
		return
	}

	response.Created(c, "Đăng ký thành công", gin.H{
		"user":          result.User,
		"access_token":  result.AccessToken,
		"refresh_token": result.RefreshToken,
		"expires_in":    result.ExpiresIn,
	})
}

// Login handles user login
// @Summary Login user
// @Description Authenticate user with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param input body usecase.LoginInput true "Login input"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Router /api/v1/auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var input usecase.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "Dữ liệu không hợp lệ: "+err.Error())
		return
	}

	result, err := h.authUseCase.Login(c.Request.Context(), &input)
	if err != nil {
		h.handleAuthError(c, err)
		return
	}

	response.OK(c, "Đăng nhập thành công", gin.H{
		"user":          result.User,
		"access_token":  result.AccessToken,
		"refresh_token": result.RefreshToken,
		"expires_in":    result.ExpiresIn,
	})
}

// GetProfile handles getting current user profile
// @Summary Get user profile
// @Description Get the current authenticated user's profile
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response
// @Failure 401 {object} response.Response
// @Router /api/v1/auth/profile [get]
func (h *AuthHandler) GetProfile(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userIDStr, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "Chưa xác thực")
		return
	}

	userID, ok := userIDStr.(uuid.UUID)
	if !ok {
		response.Unauthorized(c, "Token không hợp lệ")
		return
	}

	profile, err := h.authUseCase.GetProfile(c.Request.Context(), userID)
	if err != nil {
		h.handleAuthError(c, err)
		return
	}

	response.OK(c, "Lấy thông tin thành công", profile)
}

// RefreshToken handles refresh token request
// @Summary Refresh access token
// @Description Generate a new access token using a refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param input body usecase.RefreshTokenInput true "Refresh token input"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Router /api/v1/auth/refresh-token [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var input usecase.RefreshTokenInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "Dữ liệu không hợp lệ: "+err.Error())
		return
	}

	result, err := h.authUseCase.RefreshToken(c.Request.Context(), &input)
	if err != nil {
		h.handleAuthError(c, err)
		return
	}

	response.OK(c, "Làm mới token thành công", gin.H{
		"user":          result.User,
		"access_token":  result.AccessToken,
		"refresh_token": result.RefreshToken,
		"expires_in":    result.ExpiresIn,
	})
}

// Logout handles user logout
// @Summary Logout user
// @Description Revoke a refresh token to logout
// @Tags auth
// @Accept json
// @Produce json
// @Param input body usecase.RefreshTokenInput true "Refresh token input"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Router /api/v1/auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	var input usecase.RefreshTokenInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "Dữ liệu không hợp lệ: "+err.Error())
		return
	}

	if err := h.authUseCase.Logout(c.Request.Context(), input.RefreshToken); err != nil {
		h.handleAuthError(c, err)
		return
	}

	response.OK(c, "Đăng xuất thành công", nil)
}

// LogoutAll handles logout from all devices
// @Summary Logout from all devices
// @Description Revoke all refresh tokens for the current user
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response
// @Failure 401 {object} response.Response
// @Router /api/v1/auth/logout-all [post]
func (h *AuthHandler) LogoutAll(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userIDStr, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "Chưa xác thực")
		return
	}

	userID, ok := userIDStr.(uuid.UUID)
	if !ok {
		response.Unauthorized(c, "Token không hợp lệ")
		return
	}

	if err := h.authUseCase.LogoutAll(c.Request.Context(), userID); err != nil {
		h.handleAuthError(c, err)
		return
	}

	response.OK(c, "Đăng xuất khỏi tất cả thiết bị thành công", nil)
}

// handleAuthError handles authentication errors
func (h *AuthHandler) handleAuthError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, domain.ErrUserNotFound):
		response.NotFound(c, "Không tìm thấy người dùng")
	case errors.Is(err, domain.ErrUserAlreadyExists):
		response.Conflict(c, "Email đã được sử dụng")
	case errors.Is(err, domain.ErrInvalidCredentials):
		response.Unauthorized(c, "Email hoặc mật khẩu không đúng")
	case errors.Is(err, domain.ErrUserNotActive):
		response.Forbidden(c, "Tài khoản đã bị vô hiệu hóa")
	case errors.Is(err, domain.ErrInvalidEmail):
		response.BadRequest(c, "Email không hợp lệ")
	case errors.Is(err, domain.ErrInvalidPassword):
		response.BadRequest(c, "Mật khẩu phải có ít nhất 8 ký tự")
	case errors.Is(err, domain.ErrInvalidToken):
		response.Unauthorized(c, "Token không hợp lệ")
	case errors.Is(err, domain.ErrTokenExpired):
		response.Unauthorized(c, "Token đã hết hạn")
	case errors.Is(err, domain.ErrInvalidRefreshToken):
		response.Unauthorized(c, "Refresh token không hợp lệ")
	case errors.Is(err, domain.ErrRefreshTokenExpired):
		response.Unauthorized(c, "Refresh token đã hết hạn")
	case errors.Is(err, domain.ErrRefreshTokenRevoked):
		response.Unauthorized(c, "Refresh token đã bị thu hồi")
	case errors.Is(err, domain.ErrPhoneNumberAlreadyExists):
	       response.Conflict(c, "Số điện thoại đã được sử dụng")
    case errors.Is(err, domain.ErrInvalidPhoneNumber):
	       response.BadRequest(c, "Số điện thoại không hợp lệ")
	default:
		response.InternalServerError(c, "Đã xảy ra lỗi hệ thống")
	}
}
