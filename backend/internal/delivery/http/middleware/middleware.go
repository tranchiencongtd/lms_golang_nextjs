package middleware

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// CORSMiddleware handles Cross-Origin Resource Sharing
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST, HEAD, PATCH, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

// RequestLoggerMiddleware logs all incoming requests
func RequestLoggerMiddleware() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return param.TimeStamp.Format(time.RFC3339) + " | " +
			param.StatusCodeColor() + " " + string(rune(param.StatusCode)) + param.ResetColor() + " | " +
			param.Latency.String() + " | " +
			param.ClientIP + " | " +
			param.Method + " | " +
			param.Path + "\n"
	})
}

// RecoveryMiddleware recovers from panics
func RecoveryMiddleware() gin.HandlerFunc {
	return gin.Recovery()
}
