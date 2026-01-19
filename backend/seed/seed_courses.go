//go:build seedcourses
// +build seedcourses

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
	Level           string // basic | advanced
	Grade           string // 1-12 as string
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
				level, grade, status, is_featured, created_at, updated_at
			) VALUES (
				$1, $2, $3, $4, $5, $6,
				$7, $8, $9, $10,
				$11, $12, $13, $14, $15,
				$16, $17, 'published', $18, $19, $20
			)
		`,
			courseID, c.Title, c.Slug, c.Description, c.ShortDesc, teacherID,
			c.Price, c.OriginalPrice, c.ImageURL, c.VideoPreviewURL,
			c.Rating, c.TotalReviews, c.TotalStudents, c.TotalLessons, c.DurationMinutes,
			c.Level, c.Grade, c.IsFeatured, now, now,
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
			Title:           "Toán 1 - Làm quen số và hình",
			Slug:            "toan-1-lam-quen-so-hinh",
			Description:     "Làm quen số đếm, phép cộng trừ cơ bản và hình khối trực quan cho học sinh lớp 1.",
			ShortDesc:       "Cộng trừ trong phạm vi 10, nhận biết hình khối.",
			Price:           199000,
			OriginalPrice:   399000,
			ImageURL:        "",
			VideoPreviewURL: "",
			Rating:          4.8,
			TotalReviews:    230,
			TotalStudents:   1200,
			TotalLessons:    40,
			DurationMinutes: 800,
			Level:           "basic",
			Grade:           "1",
			IsFeatured:      false,
			Sections: []sectionSeed{
				{
					Title:      "Số đếm cơ bản",
					OrderIndex: 1,
					Lessons: []lessonSeed{
						{Title: "Giới thiệu khóa học", DurationMin: 8, IsPreview: true, OrderIndex: 1},
						{Title: "Đếm số trong phạm vi 10", DurationMin: 12, OrderIndex: 2},
					},
				},
				{
					Title:      "Hình khối quanh em",
					OrderIndex: 2,
					Lessons: []lessonSeed{
						{Title: "Nhận biết hình tròn, vuông, tam giác", DurationMin: 10, OrderIndex: 1},
						{Title: "Thực hành phân loại hình", DurationMin: 12, OrderIndex: 2},
					},
				},
			},
		},
		{
			Title:           "Toán 2 - Phép cộng trừ trong phạm vi 100",
			Slug:            "toan-2-cong-tru-100",
			Description:     "Củng cố cộng trừ có nhớ, bài tập thực hành đa dạng cho học sinh lớp 2.",
			ShortDesc:       "Cộng trừ có nhớ, bài tập tình huống.",
			Price:           249000,
			OriginalPrice:   499000,
			ImageURL:        "",
			VideoPreviewURL: "",
			Rating:          4.7,
			TotalReviews:    180,
			TotalStudents:   980,
			TotalLessons:    45,
			DurationMinutes: 900,
			Level:           "basic",
			Grade:           "2",
			IsFeatured:      false,
			Sections: []sectionSeed{
				{
					Title:      "Cộng có nhớ",
					OrderIndex: 1,
					Lessons: []lessonSeed{
						{Title: "Cộng hai số có nhớ", DurationMin: 15, OrderIndex: 1},
						{Title: "Thực hành và ví dụ", DurationMin: 15, OrderIndex: 2},
					},
				},
				{
					Title:      "Trừ có nhớ",
					OrderIndex: 2,
					Lessons: []lessonSeed{
						{Title: "Trừ hai số có nhớ", DurationMin: 15, OrderIndex: 1},
						{Title: "Bài tập áp dụng", DurationMin: 15, OrderIndex: 2},
					},
				},
			},
		},
		{
			Title:           "Toán 3 - Nhân chia cơ bản",
			Slug:            "toan-3-nhan-chia-co-ban",
			Description:     "Giới thiệu phép nhân và chia, bảng cửu chương và ứng dụng thực tế.",
			ShortDesc:       "Bảng cửu chương, nhân chia số có hai chữ số.",
			Price:           299000,
			OriginalPrice:   599000,
			ImageURL:        "",
			VideoPreviewURL: "",
			Rating:          4.8,
			TotalReviews:    260,
			TotalStudents:   1500,
			TotalLessons:    55,
			DurationMinutes: 1100,
			Level:           "basic",
			Grade:           "3",
			IsFeatured:      true,
			Sections: []sectionSeed{
				{
					Title:      "Bảng cửu chương",
					OrderIndex: 1,
					Lessons: []lessonSeed{
						{Title: "Học bảng 2,3,4", DurationMin: 18, OrderIndex: 1},
						{Title: "Học bảng 5,6,7", DurationMin: 18, OrderIndex: 2},
					},
				},
				{
					Title:      "Nhân chia số có hai chữ số",
					OrderIndex: 2,
					Lessons: []lessonSeed{
						{Title: "Nhân không nhớ", DurationMin: 20, OrderIndex: 1},
						{Title: "Chia có dư", DurationMin: 20, OrderIndex: 2},
					},
				},
			},
		},
		{
			Title:           "Toán 4 - Phân số và hỗn số",
			Slug:            "toan-4-phan-so",
			Description:     "Phân số cơ bản, rút gọn, quy đồng và so sánh phân số.",
			ShortDesc:       "Phân số cơ bản và bài tập ứng dụng.",
			Price:           349000,
			OriginalPrice:   699000,
			ImageURL:        "",
			VideoPreviewURL: "",
			Rating:          4.6,
			TotalReviews:    140,
			TotalStudents:   800,
			TotalLessons:    50,
			DurationMinutes: 1000,
			Level:           "basic",
			Grade:           "4",
			IsFeatured:      false,
			Sections: []sectionSeed{
				{
					Title:      "Khái niệm phân số",
					OrderIndex: 1,
					Lessons: []lessonSeed{
						{Title: "Phân số là gì", DurationMin: 18, IsPreview: true, OrderIndex: 1},
						{Title: "Rút gọn phân số", DurationMin: 20, OrderIndex: 2},
					},
				},
				{
					Title:      "Quy đồng và so sánh",
					OrderIndex: 2,
					Lessons: []lessonSeed{
						{Title: "Quy đồng mẫu số", DurationMin: 20, OrderIndex: 1},
						{Title: "So sánh phân số", DurationMin: 20, OrderIndex: 2},
					},
				},
			},
		},
		{
			Title:           "Toán 5 - Số thập phân và tỉ số phần trăm",
			Slug:            "toan-5-so-thap-phan",
			Description:     "Nắm vững số thập phân, phép tính và ứng dụng tỉ số phần trăm.",
			ShortDesc:       "Số thập phân, phần trăm, bài tập thực tế.",
			Price:           399000,
			OriginalPrice:   799000,
			ImageURL:        "",
			VideoPreviewURL: "",
			Rating:          4.7,
			TotalReviews:    160,
			TotalStudents:   950,
			TotalLessons:    55,
			DurationMinutes: 1100,
			Level:           "basic",
			Grade:           "5",
			IsFeatured:      false,
			Sections: []sectionSeed{
				{
					Title:      "Số thập phân",
					OrderIndex: 1,
					Lessons: []lessonSeed{
						{Title: "Giới thiệu số thập phân", DurationMin: 20, OrderIndex: 1},
						{Title: "Phép cộng trừ thập phân", DurationMin: 20, OrderIndex: 2},
					},
				},
			},
		},
		{
			Title:           "Toán 6 - Tỉ lệ thức và biểu đồ",
			Slug:            "toan-6-ti-le-thuc",
			Description:     "Tỉ lệ thức, phần trăm, đọc hiểu biểu đồ cột và tròn.",
			ShortDesc:       "Tỉ lệ thức và thống kê cơ bản.",
			Price:           450000,
			OriginalPrice:   850000,
			ImageURL:        "",
			VideoPreviewURL: "",
			Rating:          4.5,
			TotalReviews:    120,
			TotalStudents:   700,
			TotalLessons:    48,
			DurationMinutes: 960,
			Level:           "basic",
			Grade:           "6",
			IsFeatured:      false,
			Sections: []sectionSeed{
				{
					Title:      "Tỉ lệ thức",
					OrderIndex: 1,
					Lessons: []lessonSeed{
						{Title: "Khái niệm tỉ lệ", DurationMin: 20, OrderIndex: 1},
						{Title: "Bài tập áp dụng", DurationMin: 20, OrderIndex: 2},
					},
				},
			},
		},
		{
			Title:           "Toán 7 - Đại số cơ bản",
			Slug:            "toan-7-dai-so-co-ban",
			Description:     "Biểu thức đại số, hằng đẳng thức và phương trình bậc nhất một ẩn.",
			ShortDesc:       "Biểu thức và phương trình cơ bản.",
			Price:           550000,
			OriginalPrice:   990000,
			ImageURL:        "",
			VideoPreviewURL: "",
			Rating:          4.6,
			TotalReviews:    200,
			TotalStudents:   1200,
			TotalLessons:    60,
			DurationMinutes: 1350,
			Level:           "basic",
			Grade:           "7",
			IsFeatured:      true,
			Sections: []sectionSeed{
				{
					Title:      "Biểu thức đại số",
					OrderIndex: 1,
					Lessons: []lessonSeed{
						{Title: "Cộng trừ đơn thức, đa thức", DurationMin: 25, OrderIndex: 1},
						{Title: "Hằng đẳng thức đáng nhớ", DurationMin: 25, OrderIndex: 2},
					},
				},
			},
		},
		{
			Title:           "Toán 8 - Hình học tam giác",
			Slug:            "toan-8-hinh-hoc-tam-giac",
			Description:     "Tính chất tam giác, đường cao, trung tuyến, phân giác và ứng dụng.",
			ShortDesc:       "Tam giác và các đường đặc biệt.",
			Price:           650000,
			OriginalPrice:   1100000,
			ImageURL:        "",
			VideoPreviewURL: "",
			Rating:          4.7,
			TotalReviews:    190,
			TotalStudents:   1000,
			TotalLessons:    62,
			DurationMinutes: 1500,
			Level:           "basic",
			Grade:           "8",
			IsFeatured:      false,
			Sections: []sectionSeed{
				{
					Title:      "Tính chất tam giác",
					OrderIndex: 1,
					Lessons: []lessonSeed{
						{Title: "Đường cao, trung tuyến", DurationMin: 25, OrderIndex: 1},
						{Title: "Phân giác và ứng dụng", DurationMin: 25, OrderIndex: 2},
					},
				},
			},
		},
		{
			Title:           "Toán 9 - Hàm bậc hai và đồ thị",
			Slug:            "toan-9-ham-bac-hai",
			Description:     "Hàm bậc hai, đồ thị parabol, định lý Viète và ứng dụng giải phương trình.",
			ShortDesc:       "Hàm bậc hai và bài tập đồ thị.",
			Price:           750000,
			OriginalPrice:   1250000,
			ImageURL:        "",
			VideoPreviewURL: "",
			Rating:          4.8,
			TotalReviews:    320,
			TotalStudents:   2100,
			TotalLessons:    80,
			DurationMinutes: 1800,
			Level:           "advanced",
			Grade:           "9",
			IsFeatured:      true,
			Sections: []sectionSeed{
				{
					Title:      "Hàm số bậc hai",
					OrderIndex: 1,
					Lessons: []lessonSeed{
						{Title: "Đồ thị parabol", DurationMin: 30, OrderIndex: 1},
						{Title: "Định lý Viète", DurationMin: 30, OrderIndex: 2},
					},
				},
			},
		},
		{
			Title:           "Toán 10 - Đại số và Giải tích nhập môn",
			Slug:            "toan-10-dai-so-giai-tich",
			Description:     "Hàm số bậc nhất, bậc hai, vectơ, tọa độ và bất đẳng thức cơ bản.",
			ShortDesc:       "Đại số và hình học giải tích nền tảng.",
			Price:           890000,
			OriginalPrice:   1500000,
			ImageURL:        "",
			VideoPreviewURL: "",
			Rating:          4.9,
			TotalReviews:    410,
			TotalStudents:   2800,
			TotalLessons:    95,
			DurationMinutes: 2200,
			Level:           "advanced",
			Grade:           "10",
			IsFeatured:      true,
			Sections: []sectionSeed{
				{
					Title:      "Hàm số bậc nhất - bậc hai",
					OrderIndex: 1,
					Lessons: []lessonSeed{
						{Title: "Ôn tập hàm bậc nhất", DurationMin: 35, OrderIndex: 1},
						{Title: "Hàm bậc hai và đồ thị", DurationMin: 35, OrderIndex: 2},
					},
				},
			},
		},
		{
			Title:           "Toán 11 - Tổ hợp xác suất",
			Slug:            "toan-11-to-hop-xac-suat",
			Description:     "Hoán vị, chỉnh hợp, tổ hợp và các quy tắc xác suất cơ bản.",
			ShortDesc:       "Tổ hợp và xác suất cơ bản, nhiều ví dụ thực hành.",
			Price:           950000,
			OriginalPrice:   1600000,
			ImageURL:        "",
			VideoPreviewURL: "",
			Rating:          4.8,
			TotalReviews:    260,
			TotalStudents:   1500,
			TotalLessons:    85,
			DurationMinutes: 2000,
			Level:           "advanced",
			Grade:           "11",
			IsFeatured:      false,
			Sections: []sectionSeed{
				{
					Title:      "Hoán vị - chỉnh hợp - tổ hợp",
					OrderIndex: 1,
					Lessons: []lessonSeed{
						{Title: "Quy tắc nhân, cộng", DurationMin: 35, OrderIndex: 1},
						{Title: "Bài tập tổ hợp", DurationMin: 35, OrderIndex: 2},
					},
				},
			},
		},
		{
			Title:           "Toán 12 - Luyện thi THPT Quốc Gia",
			Slug:            "toan-12-luyen-thi-thpt",
			Description:     "Ôn tập tổng hợp, bám sát cấu trúc đề thi, phân loại câu hỏi theo mức độ.",
			ShortDesc:       "Ôn luyện toàn diện, giải chi tiết đề minh họa.",
			Price:           1200000,
			OriginalPrice:   2000000,
			ImageURL:        "",
			VideoPreviewURL: "",
			Rating:          4.9,
			TotalReviews:    520,
			TotalStudents:   3200,
			TotalLessons:    120,
			DurationMinutes: 3600,
			Level:           "advanced",
			Grade:           "12",
			IsFeatured:      true,
			Sections: []sectionSeed{
				{
					Title:      "Ứng dụng đạo hàm",
					OrderIndex: 1,
					Lessons: []lessonSeed{
						{Title: "Sự đồng biến, nghịch biến", DurationMin: 45, IsPreview: true, OrderIndex: 1},
						{Title: "Cực trị hàm số", DurationMin: 45, OrderIndex: 2},
					},
				},
			},
		},
	}
}
