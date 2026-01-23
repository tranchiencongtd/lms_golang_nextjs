package middleware

import (
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/mathvn/backend/internal/delivery/http/response"
)

// AdminMiddleware ensures user has admin role
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("userRole")
		if !exists {
			response.Unauthorized(c, "Không tìm thấy thông tin quyền hạn")
			c.Abort()
			return
		}

		// Robust conversion to string matches any string-like type
		roleStr := fmt.Sprintf("%v", role)

		if strings.ToLower(roleStr) != "admin" {
			response.Forbidden(c, "Yêu cầu quyền quản trị viên")
			c.Abort()
			return
		}

		c.Next()
	}
}
