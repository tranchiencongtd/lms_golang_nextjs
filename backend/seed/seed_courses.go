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
)

type lessonSeed struct {
	Title       string
	DurationMin int
	IsPreview   bool
	YouTubeID   *string
	OrderIndex  int
}

type sectionSeed struct {
	Title      string
	OrderIndex int
	Lessons    []lessonSeed
}

type courseSeed struct {
	Title           string
	Slug            string
	Description     string
	ShortDesc       string
	Price           float64
	OriginalPrice   float64
	ImageURL        string
	VideoPreviewURL string
	Rating          float64
	TotalReviews    int
	TotalStudents   int
	TotalLessons    int
	DurationMinutes int
	Level           string
	Grade           string
	Topic           string
	Badge           string
	BadgeColor      string
	IsFeatured      bool
	Sections        []sectionSeed
}

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

	teacherID, err := getUserIDByEmail(db, "teacher@mathvn.vn")
	if err != nil {
		fmt.Println("❌ Need a teacher user (seed_users) before seeding courses:", err)
		os.Exit(1)
	}

	courses := sampleCourses()

	for _, c := range courses {
		courseID := uuid.New()
		now := time.Now()

		_, err := db.Exec(context.Background(), `
			INSERT INTO courses (
				id, title, slug, description, short_description, instructor_id,
				price, original_price, image_url, video_preview_url,
				rating, total_reviews, total_students, total_lessons, duration_minutes,
				level, grade, topic, language, badge, badge_color, certificate,
				status, is_featured, created_at, updated_at
			) VALUES (
				$1, $2, $3, $4, $5, $6,
				$7, $8, $9, $10,
				$11, $12, $13, $14, $15,
				$16, $17, $18, 'vi', $19, $20, true,
				'published', $21, $22, $23
			)
		`,
			courseID, c.Title, c.Slug, c.Description, c.ShortDesc, teacherID,
			c.Price, c.OriginalPrice, c.ImageURL, c.VideoPreviewURL,
			c.Rating, c.TotalReviews, c.TotalStudents, c.TotalLessons, c.DurationMinutes,
			c.Level, c.Grade, c.Topic, c.Badge, c.BadgeColor, c.IsFeatured, now, now,
		)
		if err != nil {
			fmt.Printf("Failed to insert course %s: %v\n", c.Title, err)
			continue
		}

		for _, s := range c.Sections {
			sectionID := uuid.New()
			_, err := db.Exec(context.Background(), `
				INSERT INTO course_sections (id, course_id, title, description, order_index, created_at, updated_at)
				VALUES ($1, $2, $3, $4, $5, $6, $6)
			`, sectionID, courseID, s.Title, "", s.OrderIndex, now)
			if err != nil {
				fmt.Printf("  Failed to insert section %s: %v\n", s.Title, err)
				continue
			}

			for _, l := range s.Lessons {
				_, err := db.Exec(context.Background(), `
					INSERT INTO course_lessons (
						id, section_id, course_id, title, description,
						video_url, youtube_id, duration_minutes, order_index, is_preview,
						created_at, updated_at
					) VALUES (
						uuid_generate_v4(), $1, $2, $3, $4,
						$5, $6, $7, $8, $9,
						$10, $10
					)
				`,
					sectionID, courseID, l.Title, "",
					nil, l.YouTubeID, l.DurationMin, l.OrderIndex, l.IsPreview,
					now,
				)
				if err != nil {
					fmt.Printf("    Failed to insert lesson %s: %v\n", l.Title, err)
				}
			}
		}

		fmt.Printf("✅ Seeded course: %s\n", c.Title)
	}

	fmt.Println("Seeding courses done.")
}

func getUserIDByEmail(db *pgxpool.Pool, email string) (uuid.UUID, error) {
	var id uuid.UUID
	err := db.QueryRow(context.Background(), `SELECT id FROM users WHERE email = $1`, email).Scan(&id)
	return id, err
}

func sampleCourses() []courseSeed {
	return []courseSeed{
		{
			Title:           "Toán 12 - Luyện thi THPT Quốc Gia",
			Slug:            "toan-12-luyen-thi-thpt",
			Description:     "Khóa học toàn diện cho học sinh 12, luyện thi THPT Quốc Gia với lộ trình rõ ràng và bài tập chọn lọc.",
			ShortDesc:       "Luyện thi THPT QG Toán 12, đầy đủ chủ đề, bài tập nâng cao.",
			Price:           1200000,
			OriginalPrice:   2000000,
			ImageURL:        "",
			VideoPreviewURL: "",
			Rating:          4.9,
			TotalReviews:    3200,
			TotalStudents:   12500,
			TotalLessons:    120,
			DurationMinutes: 3600, // 60 giờ
			Level:           "advanced",
			Grade:           "12",
			Topic:           "giai-tich",
			Badge:           "Bestseller",
			BadgeColor:      "bg-primary-600",
			IsFeatured:      true,
			Sections: []sectionSeed{
				{
					Title:      "Ứng dụng đạo hàm",
					OrderIndex: 1,
					Lessons: []lessonSeed{
						{Title: "Giới thiệu khóa học", DurationMin: 10, IsPreview: true, OrderIndex: 1},
						{Title: "Sự đồng biến, nghịch biến của hàm số", DurationMin: 45, IsPreview: true, OrderIndex: 2},
						{Title: "Cực trị của hàm số", DurationMin: 50, OrderIndex: 3},
					},
				},
				{
					Title:      "Hàm số mũ và logarit",
					OrderIndex: 2,
					Lessons: []lessonSeed{
						{Title: "Hàm số mũ", DurationMin: 40, OrderIndex: 1},
						{Title: "Logarit và phương trình logarit", DurationMin: 55, OrderIndex: 2},
					},
				},
			},
		},
		{
			Title:           "Hình học không gian từ A-Z",
			Slug:            "hinh-hoc-khong-gian-a-z",
			Description:     "Khóa học hình học không gian đầy đủ, dễ hiểu, nhiều ví dụ trực quan.",
			ShortDesc:       "Hình học không gian với ví dụ trực quan, bài tập chọn lọc.",
			Price:           800000,
			OriginalPrice:   1500000,
			ImageURL:        "",
			VideoPreviewURL: "",
			Rating:          4.8,
			TotalReviews:    2100,
			TotalStudents:   8900,
			TotalLessons:    85,
			DurationMinutes: 2520, // 42 giờ
			Level:           "intermediate",
			Grade:           "11",
			Topic:           "hinh-hoc",
			Badge:           "Hot",
			BadgeColor:      "bg-red-500",
			IsFeatured:      true,
			Sections: []sectionSeed{
				{
					Title:      "Vectơ và tọa độ",
					OrderIndex: 1,
					Lessons: []lessonSeed{
						{Title: "Ôn tập vectơ", DurationMin: 35, OrderIndex: 1},
						{Title: "Phương trình mặt phẳng", DurationMin: 40, OrderIndex: 2},
					},
				},
				{
					Title:      "Khối đa diện",
					OrderIndex: 2,
					Lessons: []lessonSeed{
						{Title: "Hình chóp và hình lăng trụ", DurationMin: 45, IsPreview: true, OrderIndex: 1},
						{Title: "Thể tích khối đa diện", DurationMin: 50, OrderIndex: 2},
					},
				},
			},
		},
		{
			Title:           "Đại số tuyến tính cơ bản",
			Slug:            "dai-so-tuyen-tinh-co-ban",
			Description:     "Khóa học nền tảng đại số tuyến tính cho học sinh THPT và sinh viên năm nhất.",
			ShortDesc:       "Ma trận, định thức, không gian vector, cơ sở vững chắc.",
			Price:           600000,
			OriginalPrice:   1000000,
			ImageURL:        "",
			VideoPreviewURL: "",
			Rating:          4.7,
			TotalReviews:    980,
			TotalStudents:   4500,
			TotalLessons:    65,
			DurationMinutes: 1920, // 32 giờ
			Level:           "basic",
			Grade:           "10",
			Topic:           "dai-so",
			Badge:           "Mới",
			BadgeColor:      "bg-green-600",
			IsFeatured:      false,
			Sections: []sectionSeed{
				{
					Title:      "Ma trận và định thức",
					OrderIndex: 1,
					Lessons: []lessonSeed{
						{Title: "Định thức và tính chất", DurationMin: 40, OrderIndex: 1},
						{Title: "Nghịch đảo ma trận", DurationMin: 35, OrderIndex: 2},
					},
				},
				{
					Title:      "Hệ phương trình tuyến tính",
					OrderIndex: 2,
					Lessons: []lessonSeed{
						{Title: "Phương pháp Gauss", DurationMin: 45, OrderIndex: 1},
						{Title: "Ứng dụng thực tế", DurationMin: 30, OrderIndex: 2},
					},
				},
			},
		},
		{
			Title:           "Luyện đề thi thử THPT Quốc Gia",
			Slug:            "luyen-de-thpt-quoc-gia",
			Description:     "Bộ đề chọn lọc, cập nhật sát cấu trúc thi, kèm giải chi tiết.",
			ShortDesc:       "Đề thi thử, phân loại mức độ, giải chi tiết.",
			Price:           1000000,
			OriginalPrice:   1800000,
			ImageURL:        "",
			VideoPreviewURL: "",
			Rating:          4.9,
			TotalReviews:    4500,
			TotalStudents:   15000,
			TotalLessons:    100,
			DurationMinutes: 3000, // 50 giờ
			Level:           "advanced",
			Grade:           "12",
			Topic:           "luyen-de",
			Badge:           "Phổ biến",
			BadgeColor:      "bg-primary-600",
			IsFeatured:      true,
			Sections: []sectionSeed{
				{
					Title:      "Đề luyện tập",
					OrderIndex: 1,
					Lessons: []lessonSeed{
						{Title: "Đề số 1", DurationMin: 60, IsPreview: true, OrderIndex: 1},
						{Title: "Đề số 2", DurationMin: 60, OrderIndex: 2},
					},
				},
				{
					Title:      "Chữa đề chi tiết",
					OrderIndex: 2,
					Lessons: []lessonSeed{
						{Title: "Chữa đề số 1", DurationMin: 55, OrderIndex: 1},
						{Title: "Chữa đề số 2", DurationMin: 55, OrderIndex: 2},
					},
				},
			},
		},
	}
}
