//go:build seedactivation
// +build seedactivation

package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/mathvn/backend/config"
	"github.com/mathvn/backend/internal/domain"
)

func main() {
	_ = godotenv.Load()
	cfg, err := config.Load()
	if err != nil {
		fmt.Println("❌ Failed to load config:", err)
		os.Exit(1)
	}

	db, err := pgxpool.New(context.Background(), cfg.Database.GetDSN())
	if err != nil {
		fmt.Println("❌ Failed to connect to database:", err)
		os.Exit(1)
	}
	defer db.Close()

	// Get admin user ID
	adminID, err := getUserIDByEmail(db, "admin@mathvn.vn")
	if err != nil {
		fmt.Println("❌ Need admin user (seed_users) before seeding activation codes:", err)
		os.Exit(1)
	}

	// Get course IDs
	courseIDs, err := getCourseIDs(db)
	if err != nil || len(courseIDs) == 0 {
		fmt.Println("❌ Need courses (seed_courses) before seeding activation codes:", err)
		os.Exit(1)
	}

	now := time.Now()
	expiresIn30Days := now.Add(30 * 24 * time.Hour)
	expiresIn90Days := now.Add(90 * 24 * time.Hour)
	expiresIn365Days := now.Add(365 * 24 * time.Hour)

	// Sample activation codes - 10 records
	activationCodes := []struct {
		courseIndex int        // Index in courseIDs slice
		maxUses     *int       // nil = unlimited
		expiresAt   *time.Time // nil = never expires
		note        string
	}{
		// Codes for first course (Toán 1)
		{0, intPtr(1), &expiresIn30Days, "Mã dùng một lần - Toán 1"},
		{0, intPtr(5), &expiresIn90Days, "Mã giới hạn 5 lần - Toán 1"},
		
		// Codes for second course (Toán 2)  
		{1, nil, &expiresIn365Days, "Mã không giới hạn lượt - Toán 2"},
		{1, intPtr(10), nil, "Mã vĩnh viễn 10 lượt - Toán 2"},
		
		// Codes for third course (Toán 3)
		{2, intPtr(3), &expiresIn30Days, "Mã khuyến mãi tháng - Toán 3"},
		{2, intPtr(100), &expiresIn365Days, "Mã số lượng lớn - Toán 3"},
		
		// Codes for various courses
		{3, intPtr(1), &expiresIn30Days, "Mã đơn lẻ - Toán 4"},
		{4, intPtr(2), &expiresIn90Days, "Mã đôi - Toán 5"},
		{5, nil, nil, "Mã VIP không giới hạn - Toán 6"},
		{6, intPtr(50), &expiresIn365Days, "Mã nhóm học - Toán 7"},
	}

	for i, ac := range activationCodes {
		// Ensure courseIndex is within bounds
		courseIdx := ac.courseIndex
		if courseIdx >= len(courseIDs) {
			courseIdx = 0
		}

		// Generate activation code
		codeStr, err := domain.GenerateActivationCode()
		if err != nil {
			fmt.Printf("Failed to generate code %d: %v\n", i+1, err)
			continue
		}

		_, err = db.Exec(context.Background(), `
			INSERT INTO activation_codes (
				id, code, course_id, max_uses, current_uses, expires_at, 
				is_active, created_by, note, created_at, updated_at
			) VALUES (
				$1, $2, $3, $4, 0, $5, 
				true, $6, $7, $8, $8
			)
		`,
			uuid.New(), codeStr, courseIDs[courseIdx], ac.maxUses, ac.expiresAt,
			adminID, ac.note, now,
		)
		if err != nil {
			fmt.Printf("Failed to insert activation code %d: %v\n", i+1, err)
		} else {
			fmt.Printf("✅ Seeded activation code: %s (Course: %s)\n", codeStr, courseIDs[courseIdx])
		}
	}

	fmt.Println("\n🎉 Seeding activation codes done!")
	fmt.Println("📋 Use these codes to test the activation feature.")
}

func getUserIDByEmail(db *pgxpool.Pool, email string) (uuid.UUID, error) {
	var id uuid.UUID
	err := db.QueryRow(context.Background(), `SELECT id FROM users WHERE email = $1`, email).Scan(&id)
	return id, err
}

func getCourseIDs(db *pgxpool.Pool) ([]uuid.UUID, error) {
	rows, err := db.Query(context.Background(), `SELECT id FROM courses ORDER BY created_at LIMIT 12`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ids []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, nil
}

func intPtr(i int) *int {
	return &i
}
