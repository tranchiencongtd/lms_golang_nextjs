package router

import (
	"github.com/gin-gonic/gin"
	"github.com/mathvn/backend/internal/delivery/http/handler"
	"github.com/mathvn/backend/internal/delivery/http/middleware"
	"github.com/mathvn/backend/internal/usecase"
)

// Router holds all route handlers
type Router struct {
	authHandler       *handler.AuthHandler
	courseHandler     *handler.CourseHandler
	enrollmentHandler *handler.EnrollmentHandler
	authUseCase       usecase.AuthUseCase
}

// NewRouter creates a new router
func NewRouter(
	authHandler *handler.AuthHandler,
	courseHandler *handler.CourseHandler,
	enrollmentHandler *handler.EnrollmentHandler,
	authUseCase usecase.AuthUseCase,
) *Router {
	return &Router{
		authHandler:       authHandler,
		courseHandler:     courseHandler,
		enrollmentHandler: enrollmentHandler,
		authUseCase:       authUseCase,
	}
}

// Setup configures all routes
func (r *Router) Setup(engine *gin.Engine) {
	// Global middlewares
	engine.Use(middleware.CORSMiddleware())
	engine.Use(middleware.RecoveryMiddleware())

	// Health check
	engine.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "MathVN API is running",
		})
	})

	// API v1 routes
	v1 := engine.Group("/api/v1")
	{
		// Public auth routes
		auth := v1.Group("/auth")
		{
			auth.POST("/register", r.authHandler.Register)
			auth.POST("/login", r.authHandler.Login)
			auth.POST("/refresh-token", r.authHandler.RefreshToken)
			auth.POST("/logout", r.authHandler.Logout)
		}

		// Protected auth routes
		authProtected := v1.Group("/auth")
		authProtected.Use(middleware.AuthMiddleware(r.authUseCase))
		{
			authProtected.GET("/profile", r.authHandler.GetProfile)
			authProtected.PUT("/profile", r.authHandler.UpdateProfile)
			authProtected.POST("/change-password", r.authHandler.ChangePassword)
			authProtected.POST("/logout-all", r.authHandler.LogoutAll)
		}

		// Public course routes
		courses := v1.Group("/courses")
		{
			courses.GET("", r.courseHandler.ListCourses)
			courses.GET("/:id", r.courseHandler.GetCourse)
		}

		// Protected enrollment routes
		enrollments := v1.Group("/enrollments")
		enrollments.Use(middleware.AuthMiddleware(r.authUseCase))
		{
			enrollments.POST("/activate", r.enrollmentHandler.ActivateCourse)
			enrollments.GET("/my-courses", r.enrollmentHandler.GetMyCourses)
			enrollments.GET("/check/:courseId", r.enrollmentHandler.CheckEnrollment)
			enrollments.POST("/activation-codes", r.enrollmentHandler.CreateActivationCode)
		}
	}
}
