package usecase

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/domain"
	"github.com/mathvn/backend/internal/repository"
)

// enrollmentUseCase implements EnrollmentUseCase
type enrollmentUseCase struct {
	enrollmentRepo     repository.EnrollmentRepository
	activationCodeRepo repository.ActivationCodeRepository
	courseRepo         repository.CourseRepository
	userRepo           repository.UserRepository
}

// NewEnrollmentUseCase creates a new enrollment use case
func NewEnrollmentUseCase(
	enrollmentRepo repository.EnrollmentRepository,
	activationCodeRepo repository.ActivationCodeRepository,
	courseRepo repository.CourseRepository,
	userRepo repository.UserRepository,
) EnrollmentUseCase {
	return &enrollmentUseCase{
		enrollmentRepo:     enrollmentRepo,
		activationCodeRepo: activationCodeRepo,
		courseRepo:         courseRepo,
		userRepo:           userRepo,
	}
}

// ActivateCourse redeems an activation code and enrolls the user in the course
func (uc *enrollmentUseCase) ActivateCourse(ctx context.Context, userID uuid.UUID, input *ActivateCourseInput) (*ActivateCourseResult, error) {
	// Normalize the code (trim spaces, uppercase)
	code := strings.TrimSpace(strings.ToUpper(input.Code))
	if code == "" {
		return nil, domain.ErrActivationCodeInvalid
	}

	// Get the activation code
	activationCode, err := uc.activationCodeRepo.GetByCode(ctx, code)
	if err != nil {
		return nil, err
	}

	// Validate the activation code
	if err := activationCode.IsValid(); err != nil {
		return nil, err
	}

	// Check if user is already enrolled
	isEnrolled, err := uc.enrollmentRepo.IsEnrolled(ctx, userID, activationCode.CourseID)
	if err != nil {
		return nil, err
	}
	if isEnrolled {
		return nil, domain.ErrAlreadyEnrolled
	}

	now := time.Now()
	expiresAt := now.AddDate(1, 0, 0) // Valid for 1 year from activation

	// Create enrollment
	enrollment := &domain.Enrollment{
		ID:               uuid.New(),
		UserID:           userID,
		CourseID:         activationCode.CourseID,
		ActivationCodeID: &activationCode.ID,
		EnrolledAt:       now,
		ExpiresAt:        &expiresAt,
		Status:           domain.EnrollmentStatusActive,
	}

	// If activation code has expiry, set enrollment expiry too (optional logic)
	// For now, we give lifetime access once activated

	if err := uc.enrollmentRepo.Create(ctx, enrollment); err != nil {
		return nil, err
	}

	// Increment activation code uses
	if err := uc.activationCodeRepo.IncrementUses(ctx, activationCode.ID); err != nil {
		// Log error but don't fail the activation
		// In production, this should be handled in a transaction
	}

	// Return result with course info
	return &ActivateCourseResult{
		Enrollment: enrollment,
		Course:     activationCode.Course,
	}, nil
}

// GetUserEnrollments retrieves all enrollments for a user with course details
func (uc *enrollmentUseCase) GetUserEnrollments(ctx context.Context, userID uuid.UUID) ([]*domain.Enrollment, error) {
	return uc.enrollmentRepo.GetByUserIDWithCourse(ctx, userID)
}

// IsEnrolled checks if a user is enrolled in a specific course
func (uc *enrollmentUseCase) IsEnrolled(ctx context.Context, userID, courseID uuid.UUID) (bool, error) {
	return uc.enrollmentRepo.IsEnrolled(ctx, userID, courseID)
}

// GetEnrollment retrieves a specific enrollment
func (uc *enrollmentUseCase) GetEnrollment(ctx context.Context, userID, courseID uuid.UUID) (*domain.Enrollment, error) {
	return uc.enrollmentRepo.GetByUserAndCourse(ctx, userID, courseID)
}

// CreateActivationCode creates a new activation code (admin only)
func (uc *enrollmentUseCase) CreateActivationCode(ctx context.Context, adminID uuid.UUID, input *CreateActivationCodeInput) (*CreateActivationCodeResult, error) {
	// Verify course exists
	_, err := uc.courseRepo.GetByID(ctx, input.CourseID)
	if err != nil {
		return nil, err
	}

	// Generate unique code
	codeStr, err := domain.GenerateActivationCode()
	if err != nil {
		return nil, err
	}

	// Parse expires_at if provided
	var expiresAt *time.Time
	if input.ExpiresAt != nil && *input.ExpiresAt != "" {
		t, err := time.Parse(time.RFC3339, *input.ExpiresAt)
		if err != nil {
			return nil, domain.ErrActivationCodeInvalid
		}
		expiresAt = &t
	}

	// Create activation code
	activationCode := &domain.ActivationCode{
		ID:          uuid.New(),
		Code:        codeStr,
		CourseID:    input.CourseID,
		MaxUses:     input.MaxUses,
		CurrentUses: 0,
		ExpiresAt:   expiresAt,
		IsActive:    true,
		CreatedBy:   adminID,
		Note:        input.Note,
	}

	if err := uc.activationCodeRepo.Create(ctx, activationCode); err != nil {
		return nil, err
	}

	return &CreateActivationCodeResult{
		ActivationCode: activationCode,
	}, nil
}

// ListActivationCodes lists activation codes (admin only)
func (uc *enrollmentUseCase) ListActivationCodes(ctx context.Context, page, pageSize int, courseID *string) ([]*domain.ActivationCode, int, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	var cID *uuid.UUID
	if courseID != nil && *courseID != "" {
		id, err := uuid.Parse(*courseID)
		if err == nil {
			cID = &id
		}
	}

	return uc.activationCodeRepo.List(ctx, cID, pageSize, offset)
}

// DeleteActivationCode deletes an activation code (admin only)
func (uc *enrollmentUseCase) DeleteActivationCode(ctx context.Context, id uuid.UUID) error {
	return uc.activationCodeRepo.Delete(ctx, id)
}

// UpdateActivationCode updates an activation code status (admin only)
func (uc *enrollmentUseCase) UpdateActivationCode(ctx context.Context, id uuid.UUID, isActive bool) (*domain.ActivationCode, error) {
	code, err := uc.activationCodeRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	code.IsActive = isActive
	code.UpdatedAt = time.Now()

	if err := uc.activationCodeRepo.Update(ctx, code); err != nil {
		return nil, err
	}

	return code, nil
}
