package router

import (
	"github.com/gin-gonic/gin"
	"github.com/mathvn/backend/internal/delivery/http/handler"
	"github.com/mathvn/backend/internal/delivery/http/middleware"
	"github.com/mathvn/backend/internal/usecase"
)

// Router holds all route handlers
type Router struct {
	authHandler         *handler.AuthHandler
	courseHandler       *handler.CourseHandler
	enrollmentHandler   *handler.EnrollmentHandler
	progressHandler     *handler.ProgressHandler
	consultationHandler *handler.ConsultationHandler
	statsHandler        *handler.StatsHandler
	adminUserHandler    *handler.AdminUserHandler
	authUseCase         usecase.AuthUseCase
}

// NewRouter creates a new router
func NewRouter(
	authHandler *handler.AuthHandler,
	courseHandler *handler.CourseHandler,
	enrollmentHandler *handler.EnrollmentHandler,
	progressHandler *handler.ProgressHandler,
	consultationHandler *handler.ConsultationHandler,
	statsHandler *handler.StatsHandler,
	adminUserHandler *handler.AdminUserHandler,
	authUseCase usecase.AuthUseCase,
) *Router {
	return &Router{
		authHandler:         authHandler,
		courseHandler:       courseHandler,
		enrollmentHandler:   enrollmentHandler,
		progressHandler:     progressHandler,
		consultationHandler: consultationHandler,
		statsHandler:        statsHandler,
		adminUserHandler:    adminUserHandler,
		authUseCase:         authUseCase,
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

		// Protected progress routes
		progress := v1.Group("/progress")
		progress.Use(middleware.AuthMiddleware(r.authUseCase))
		{
			progress.GET("/:courseId", r.progressHandler.GetCourseProgress)
			progress.POST("/:courseId/lessons/:lessonId/complete", r.progressHandler.MarkLessonCompleted)
			progress.POST("/:courseId/lessons/:lessonId/watch", r.progressHandler.UpdateWatchProgress)
			progress.POST("/:courseId/last-lesson/:lessonId", r.progressHandler.UpdateLastLesson)
		}

		// Public consultation routes
		consultations := v1.Group("/consultations")
		{
			consultations.POST("", r.consultationHandler.CreateRequest)
		}

		// Admin routes - protected by AuthMiddleware + AdminMiddleware
		admin := v1.Group("/admin")
		admin.Use(middleware.AuthMiddleware(r.authUseCase))
		admin.Use(middleware.AdminMiddleware())
		{
			// Dashboard stats
			admin.GET("/stats", r.statsHandler.GetDashboardStats)

			// User management
			admin.GET("/users", r.adminUserHandler.ListUsers)
			admin.POST("/users", r.adminUserHandler.CreateUser)
			admin.PUT("/users/:id", r.adminUserHandler.UpdateUser)
			admin.DELETE("/users/:id", r.adminUserHandler.DeleteUser)
			admin.PUT("/users/:id/role", r.adminUserHandler.UpdateUserRole)
			admin.PATCH("/users/:id/status", r.adminUserHandler.ToggleUserStatus)

			// Course management
			admin.GET("/courses", r.courseHandler.ListAdminCourses)
			admin.POST("/courses", r.courseHandler.CreateCourse)
			admin.PUT("/courses/:id", r.courseHandler.UpdateCourse)
			admin.DELETE("/courses/:id", r.courseHandler.DeleteCourse)

			// Section management
			admin.POST("/sections", r.courseHandler.CreateSection)
			admin.PUT("/sections/:id", r.courseHandler.UpdateSection)
			admin.DELETE("/sections/:id", r.courseHandler.DeleteSection)

			// Lesson management
			admin.POST("/lessons", r.courseHandler.CreateLesson)
			admin.PUT("/lessons/:id", r.courseHandler.UpdateLesson)
			admin.DELETE("/lessons/:id", r.courseHandler.DeleteLesson)
		}
	}
}
