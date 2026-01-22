package domain

import (
	"time"

	"github.com/google/uuid"
)

// CourseLevel represents the difficulty level of a course
type CourseLevel string

const (
	LevelBasic    CourseLevel = "basic"
	LevelAdvanced CourseLevel = "advanced"
)

// CourseStatus represents the status of a course
type CourseStatus string

const (
	StatusDraft     CourseStatus = "draft"
	StatusPublished CourseStatus = "published"
	StatusArchived  CourseStatus = "archived"
)

// Course represents a course entity
type Course struct {
	ID               uuid.UUID    `json:"id"`
	Title            string       `json:"title"`
	Slug             string       `json:"slug"`
	Description      string       `json:"description"`
	ShortDescription string       `json:"short_description"`
	InstructorID     uuid.UUID    `json:"instructor_id"`
	Price            float64      `json:"price"`
	OriginalPrice    *float64     `json:"original_price,omitempty"`
	ImageURL         *string      `json:"image_url,omitempty"`
	VideoPreviewURL  *string      `json:"video_preview_url,omitempty"`
	Rating           float64      `json:"rating"`
	TotalReviews     int          `json:"total_reviews"`
	TotalStudents    int          `json:"total_students"`
	TotalLessons     int          `json:"total_lessons"`
	DurationMinutes  int          `json:"duration_minutes"`
	Level            CourseLevel  `json:"level"`
	Grade            *string      `json:"grade,omitempty"`
	WhatYouLearn     *string      `json:"what_you_learn,omitempty"`
	Requirements     *string      `json:"requirements,omitempty"`
	Status           CourseStatus `json:"status"`
	IsFeatured       bool         `json:"is_featured"`
	CreatedAt        time.Time    `json:"created_at"`
	UpdatedAt        time.Time    `json:"updated_at"`

	// Relations (optional, loaded separately)
	Instructor *User            `json:"instructor,omitempty"`
	Sections   []*CourseSection `json:"sections,omitempty"`
}

// CourseSection represents a section/chapter in a course
type CourseSection struct {
	ID          uuid.UUID `json:"id"`
	CourseID    uuid.UUID `json:"course_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	OrderIndex  int       `json:"order_index"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relations
	Lessons []*CourseLesson `json:"lessons,omitempty"`
}

// CourseLesson represents a lesson in a course
type CourseLesson struct {
	ID              uuid.UUID `json:"id"`
	SectionID       uuid.UUID `json:"section_id"`
	CourseID        uuid.UUID `json:"course_id"`
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	VideoURL        *string   `json:"video_url,omitempty"`
	YouTubeID       *string   `json:"youtube_id,omitempty"`
	DurationMinutes int       `json:"duration_minutes"`
	OrderIndex      int       `json:"order_index"`
	IsPreview       bool      `json:"is_preview"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// CourseFilter represents filters for course queries
type CourseFilter struct {
	Status       *CourseStatus `json:"status,omitempty"`
	Levels       []CourseLevel `json:"levels,omitempty"`
	Grades       []string      `json:"grades,omitempty"`
	InstructorID *uuid.UUID    `json:"instructor_id,omitempty"`
	IsFeatured   *bool         `json:"is_featured,omitempty"`
	Search       *string       `json:"search,omitempty"`
}

// CourseSort represents sorting options for courses
type CourseSort string

const (
	SortCreatedAtDesc CourseSort = "created_at_desc"
	SortCreatedAtAsc  CourseSort = "created_at_asc"
	SortPriceAsc      CourseSort = "price_asc"
	SortPriceDesc     CourseSort = "price_desc"
	SortRatingDesc    CourseSort = "rating_desc"
	SortStudentsDesc  CourseSort = "students_desc"
)
