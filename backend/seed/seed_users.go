package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	// "github.com/joho/godotenv"
	"github.com/mathvn/backend/config"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// _ = godotenv.Load()
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

	password := "0123456789"
	hash, _ := bcrypt.GenerateFromPassword([]byte(password), 10)
	now := time.Now()

	users := []struct {
		email, fullName, phone, role string
		isActive, isVerified         bool
	}{
		{"admin@mathvn.vn", "Admin", "0384215155", "admin", true, true},
		{"teacher@mathvn.vn", "Teacher", "0973507865", "teacher", true, true},
		{"student@mathvn.vn", "Student", "0384215166", "student", true, false},
	}

	for _, u := range users {
		_, err := db.Exec(context.Background(),
			`INSERT INTO users (id, email, password_hash, full_name, phone_number, role, is_active, is_verified, created_at, updated_at)
			 VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9)`,
			u.email, string(hash), u.fullName, u.phone, u.role, u.isActive, u.isVerified, now, now,
		)
		if err != nil {
			fmt.Printf("Failed to insert user %s: %v\n", u.email, err)
		} else {
			fmt.Printf(" Seeded user: %s (%s)\n", u.email, u.role)
		}
	}

	fmt.Println(" Seeding done!")
}
