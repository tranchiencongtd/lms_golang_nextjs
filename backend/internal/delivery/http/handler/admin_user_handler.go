package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/delivery/http/response"
	"github.com/mathvn/backend/internal/domain"
)

type AdminUserHandler struct {
	adminUserUseCase domain.AdminUserUseCase
}

func NewAdminUserHandler(adminUserUseCase domain.AdminUserUseCase) *AdminUserHandler {
	return &AdminUserHandler{
		adminUserUseCase: adminUserUseCase,
	}
}

// ListUsers lists all users with pagination and filters
// @Summary List users
// @Tags admin/users
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by name/email/phone"
// @Param role query string false "Filter by role (student, teacher, admin)"
// @Success 200 {object} response.Response
// @Router /api/v1/admin/users [get]
func (h *AdminUserHandler) ListUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	roleStr := c.Query("role")

	var rolePtr *domain.UserRole
	if roleStr != "" {
		role := domain.UserRole(roleStr)
		if role.IsValid() {
			rolePtr = &role
		}
	}

	result, err := h.adminUserUseCase.ListUsers(c.Request.Context(), page, limit, search, rolePtr)
	if err != nil {
		response.InternalServerError(c, "Failed to fetch users")
		return
	}

	response.OK(c, "Users fetched successfully", result)
}

// CreateUser creates a new user
// @Summary Create a new user
// @Tags admin/users
// @Param body body object true "User creation payload"
// @Success 201 {object} response.Response
// @Router /api/v1/admin/users [post]
func (h *AdminUserHandler) CreateUser(c *gin.Context) {
	var req struct {
		Email       string `json:"email" binding:"required,email"`
		Password    string `json:"password" binding:"required,min=8"`
		FullName    string `json:"full_name" binding:"required"`
		PhoneNumber string `json:"phone_number"`
		Role        string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body")
		return
	}

	user := &domain.User{
		Email:       req.Email,
		FullName:    req.FullName,
		PhoneNumber: req.PhoneNumber,
		Role:        domain.UserRole(req.Role),
		IsActive:    true,
		IsVerified:  true, // Admin created users are verified by default
	}

	err := h.adminUserUseCase.CreateUser(c.Request.Context(), user, req.Password)
	if err != nil {
		if err == domain.ErrUserAlreadyExists {
			response.Conflict(c, "Email already exists")
			return
		}
		response.InternalServerError(c, "Failed to create user")
		return
	}

	response.Created(c, "User created successfully", nil)
}

// UpdateUser updates user details
// @Summary Update user details
// @Tags admin/users
// @Param id path string true "User ID"
// @Param body body object true "User update payload"
// @Success 200 {object} response.Response
// @Router /api/v1/admin/users/{id} [put]
func (h *AdminUserHandler) UpdateUser(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "Invalid user ID")
		return
	}

	var req struct {
		FullName    string `json:"full_name"`
		PhoneNumber string `json:"phone_number"`
		Role        string `json:"role"`
		IsActive    bool   `json:"is_active"`
		IsVerified  bool   `json:"is_verified"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request")
		return
	}

	user := &domain.User{
		ID:          userID,
		FullName:    req.FullName,
		PhoneNumber: req.PhoneNumber,
		Role:        domain.UserRole(req.Role),
		IsActive:    req.IsActive,
		IsVerified:  req.IsVerified,
	}

	err = h.adminUserUseCase.UpdateUser(c.Request.Context(), user)
	if err != nil {
		response.InternalServerError(c, "Failed to update user")
		return
	}

	response.OK(c, "User updated successfully", nil)
}

// DeleteUser deletes a user
// @Summary Delete a user
// @Tags admin/users
// @Param id path string true "User ID"
// @Success 200 {object} response.Response
// @Router /api/v1/admin/users/{id} [delete]
func (h *AdminUserHandler) DeleteUser(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "Invalid user ID")
		return
	}

	err = h.adminUserUseCase.DeleteUser(c.Request.Context(), userID)
	if err != nil {
		response.InternalServerError(c, "Failed to delete user")
		return
	}

	response.OK(c, "User deleted successfully", nil)
}

// UpdateUserRole updates a user's role
// @Summary Update user role
// @Tags admin/users
// @Param id path string true "User ID"
// @Param body body object true "Role update payload"
// @Success 200 {object} response.Response
// @Router /api/v1/admin/users/{id}/role [put]
func (h *AdminUserHandler) UpdateUserRole(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "Invalid user ID")
		return
	}

	var req struct {
		Role string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request")
		return
	}

	role := domain.UserRole(req.Role)
	if !role.IsValid() {
		response.BadRequest(c, "Invalid role")
		return
	}

	err = h.adminUserUseCase.UpdateUserRole(c.Request.Context(), userID, role)
	if err != nil {
		response.InternalServerError(c, "Failed to update user role")
		return
	}

	response.OK(c, "User role updated successfully", nil)
}

// ToggleUserStatus activates or deactivates a user
// @Summary Toggle user status
// @Tags admin/users
// @Param id path string true "User ID"
// @Param body body object true "Status payload"
// @Success 200 {object} response.Response
// @Router /api/v1/admin/users/{id}/status [patch]
func (h *AdminUserHandler) ToggleUserStatus(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "Invalid user ID")
		return
	}

	var req struct {
		IsActive bool `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request")
		return
	}

	err = h.adminUserUseCase.ToggleUserStatus(c.Request.Context(), userID, req.IsActive)
	if err != nil {
		response.InternalServerError(c, "Failed to update user status")
		return
	}

	response.OK(c, "User status updated successfully", nil)
}
