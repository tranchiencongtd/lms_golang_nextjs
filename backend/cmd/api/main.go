package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mathvn/backend/config"
	"github.com/mathvn/backend/internal/delivery/http/handler"
	"github.com/mathvn/backend/internal/delivery/http/router"
	"github.com/mathvn/backend/internal/repository/postgres"
	"github.com/mathvn/backend/internal/usecase"
	"github.com/mathvn/backend/pkg/database"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Set Gin mode
	if cfg.Server.Mode == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Connect to database
	db, err := database.NewPostgresConnection(&cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()
	log.Println("✅ Connected to PostgreSQL database")

	// Initialize repositories
	userRepo := postgres.NewUserRepository(db)

	// Initialize use cases
	authUseCase := usecase.NewAuthUseCase(userRepo, cfg.JWT, cfg.Bcrypt.Cost)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authUseCase)

	// Setup router
	engine := gin.New()
	engine.Use(gin.Logger())

	r := router.NewRouter(authHandler, authUseCase)
	r.Setup(engine)

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + cfg.Server.Port,
		Handler:      engine,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("🚀 Server starting on port %s", cfg.Server.Port)
		log.Printf("📖 API docs: http://localhost:%s/api/v1", cfg.Server.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("🛑 Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("👋 Server exited gracefully")
}
