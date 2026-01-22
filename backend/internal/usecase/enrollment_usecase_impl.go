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

	// Create enrollment
	enrollment := &domain.Enrollment{
		ID:               uuid.New(),
		UserID:           userID,
		CourseID:         activationCode.CourseID,
		ActivationCodeID: &activationCode.ID,
		EnrolledAt:       time.Now(),
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
