package postgres

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/mathvn/backend/internal/domain"
)

type statsRepository struct {
	db *pgxpool.Pool
}

func NewStatsRepository(db *pgxpool.Pool) domain.StatsRepository {
	return &statsRepository{db: db}
}

func (r *statsRepository) GetDashboardStats() (*domain.DashboardStats, error) {
	ctx := context.Background()
	stats := &domain.DashboardStats{}

	// Total Users
	err := r.db.QueryRow(ctx, "SELECT COUNT(*) FROM users").Scan(&stats.TotalUsers)
	if err != nil {
		log.Printf("StatsRepo Error: Counting users failed: %v", err)
		return nil, err
	}

	// Total Courses
	err = r.db.QueryRow(ctx, "SELECT COUNT(*) FROM courses WHERE is_published = true").Scan(&stats.TotalCourses)
	if err != nil {
		log.Printf("StatsRepo Error: Counting courses failed: %v", err)
		return nil, err
	}

	// Pending Consultations
	err = r.db.QueryRow(ctx, "SELECT COUNT(*) FROM consultation_requests WHERE status = 'pending'").Scan(&stats.PendingConsultations)
	if err != nil {
		log.Printf("StatsRepo Error: Counting consultations failed: %v", err)
		stats.PendingConsultations = 0
	}

	// Total Enrollments
	err = r.db.QueryRow(ctx, "SELECT COUNT(*) FROM course_enrollments").Scan(&stats.TotalEnrollments)
	if err != nil {
		log.Printf("StatsRepo Error: Counting enrollments failed: %v", err)
		return nil, err
	}

	// Total Revenue - using float64 to safely scan DECIMAL
	var revenueFloat *float64
	err = r.db.QueryRow(ctx, `
		SELECT SUM(c.price) 
		FROM course_enrollments e 
		JOIN courses c ON e.course_id = c.id
	`).Scan(&revenueFloat)

	if err != nil {
		log.Printf("StatsRepo Error: Calculating revenue failed: %v", err)
		stats.TotalRevenue = 0
	} else if revenueFloat != nil {
		stats.TotalRevenue = int64(*revenueFloat)
	}

	return stats, nil
}
