package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/mathvn/backend/internal/delivery/http/response"
	"github.com/mathvn/backend/internal/usecase"
)

// AuthMiddleware creates a new authentication middleware
func AuthMiddleware(authUseCase usecase.AuthUseCase) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, "Yêu cầu token xác thực")
			c.Abort()
			return
		}

		// Check Bearer token format
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			response.Unauthorized(c, "Định dạng token không hợp lệ")
			c.Abort()
			return
		}

		token := parts[1]

		// Validate token
		userID, err := authUseCase.ValidateToken(token)
		if err != nil {
			response.Unauthorized(c, "Token không hợp lệ hoặc đã hết hạn")
			c.Abort()
			return
		}

		// Set user ID in context
		c.Set("userID", userID)

		// Fetch user profile to get role (for authorization checks)
		profile, err := authUseCase.GetProfile(c.Request.Context(), userID)
		if err == nil && profile != nil {
			c.Set("userRole", profile.Role)
		}

		c.Next()
	}
}

