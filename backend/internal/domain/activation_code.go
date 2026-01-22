package domain

import (
	"crypto/rand"
	"encoding/hex"
	"strings"
	"time"

	"github.com/google/uuid"
)

// ActivationCode represents an activation code for course enrollment
type ActivationCode struct {
	ID          uuid.UUID  `json:"id"`
	Code        string     `json:"code"`
	CourseID    uuid.UUID  `json:"course_id"`
	MaxUses     *int       `json:"max_uses,omitempty"`
	CurrentUses int        `json:"current_uses"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
	IsActive    bool       `json:"is_active"`
	CreatedBy   uuid.UUID  `json:"created_by"`
	Note        *string    `json:"note,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`

	// Relations (optional, loaded separately)
	Course  *Course `json:"course,omitempty"`
	Creator *User   `json:"creator,omitempty"`
}

// IsValid checks if the activation code is valid for use
func (ac *ActivationCode) IsValid() error {
	if !ac.IsActive {
		return ErrActivationCodeInactive
	}

	if ac.ExpiresAt != nil && time.Now().After(*ac.ExpiresAt) {
		return ErrActivationCodeExpired
	}

	if ac.MaxUses != nil && ac.CurrentUses >= *ac.MaxUses {
		return ErrActivationCodeUsedUp
	}

	return nil
}

// CanBeUsed returns true if the code can be used
func (ac *ActivationCode) CanBeUsed() bool {
	return ac.IsValid() == nil
}

// RemainingUses returns the number of remaining uses, or -1 for unlimited
func (ac *ActivationCode) RemainingUses() int {
	if ac.MaxUses == nil {
		return -1 // Unlimited
	}
	remaining := *ac.MaxUses - ac.CurrentUses
	if remaining < 0 {
		return 0
	}
	return remaining
}

// GenerateActivationCode generates a random activation code
// Format: XXXX-XXXX-XXXX (12 characters separated by dashes)
func GenerateActivationCode() (string, error) {
	bytes := make([]byte, 6) // 6 bytes = 12 hex characters
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	hex := strings.ToUpper(hex.EncodeToString(bytes))
	// Format as XXXX-XXXX-XXXX
	return hex[0:4] + "-" + hex[4:8] + "-" + hex[8:12], nil
}

// GenerateSimpleActivationCode generates a simple alphanumeric code
// Format: XXXXXXXX (8 uppercase alphanumeric characters)
func GenerateSimpleActivationCode() (string, error) {
	const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Removed confusing chars: I, O, 0, 1
	bytes := make([]byte, 8)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	for i := range bytes {
		bytes[i] = charset[bytes[i]%byte(len(charset))]
	}

	return string(bytes), nil
}
