package domain

import (
	"time"

	"github.com/google/uuid"
)

// EnrollmentStatus represents the status of an enrollment
type EnrollmentStatus string

const (
	EnrollmentStatusActive    EnrollmentStatus = "active"
	EnrollmentStatusExpired   EnrollmentStatus = "expired"
	EnrollmentStatusCancelled EnrollmentStatus = "cancelled"
)

// IsValid checks if the enrollment status is valid
func (s EnrollmentStatus) IsValid() bool {
	switch s {
	case EnrollmentStatusActive, EnrollmentStatusExpired, EnrollmentStatusCancelled:
		return true
	}
	return false
}

// Enrollment represents a user's enrollment in a course
type Enrollment struct {
	ID               uuid.UUID        `json:"id"`
	UserID           uuid.UUID        `json:"user_id"`
	CourseID         uuid.UUID        `json:"course_id"`
	ActivationCodeID *uuid.UUID       `json:"activation_code_id,omitempty"`
	EnrolledAt       time.Time        `json:"enrolled_at"`
	ExpiresAt        *time.Time       `json:"expires_at,omitempty"`
	Status           EnrollmentStatus `json:"status"`
	CreatedAt        time.Time        `json:"created_at"`
	UpdatedAt        time.Time        `json:"updated_at"`

	// Relations (optional, loaded separately)
	User           *User           `json:"user,omitempty"`
	Course         *Course         `json:"course,omitempty"`
	ActivationCode *ActivationCode `json:"activation_code,omitempty"`
}

// IsActive checks if the enrollment is currently active
func (e *Enrollment) IsActive() bool {
	if e.Status != EnrollmentStatusActive {
		return false
	}

	// Check if expired
	if e.ExpiresAt != nil && time.Now().After(*e.ExpiresAt) {
		return false
	}

	return true
}

// HasLifetimeAccess returns true if the enrollment never expires
func (e *Enrollment) HasLifetimeAccess() bool {
	return e.ExpiresAt == nil
}

// DaysRemaining returns the number of days remaining, or -1 for lifetime access
func (e *Enrollment) DaysRemaining() int {
	if e.ExpiresAt == nil {
		return -1 // Lifetime access
	}

	remaining := time.Until(*e.ExpiresAt)
	if remaining < 0 {
		return 0
	}

	return int(remaining.Hours() / 24)
}
