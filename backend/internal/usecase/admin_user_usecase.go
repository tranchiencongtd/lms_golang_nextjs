package usecase

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/domain"
	"github.com/mathvn/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type adminUserUseCase struct {
	userRepo repository.UserRepository
}

func NewAdminUserUseCase(userRepo repository.UserRepository) domain.AdminUserUseCase {
	return &adminUserUseCase{
		userRepo: userRepo,
	}
}

func (uc *adminUserUseCase) ListUsers(ctx context.Context, page, limit int, search string, role *domain.UserRole) (*domain.PaginatedUsers, error) {
	return uc.userRepo.ListUsersWithPagination(ctx, page, limit, search, role)
}

func (uc *adminUserUseCase) CreateUser(ctx context.Context, user *domain.User, password string) error {
	// Check if email exists
	exists, err := uc.userRepo.ExistsByEmail(ctx, user.Email)
	if err != nil {
		return err
	}
	if exists {
		return domain.ErrUserAlreadyExists // Make sure this error exists or use typical error
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.PasswordHash = string(hashedPassword)

	// Set default fields
	user.ID = uuid.New()
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	if user.Role == "" {
		user.Role = domain.RoleStudent
	}

	return uc.userRepo.Create(ctx, user)
}

func (uc *adminUserUseCase) UpdateUser(ctx context.Context, user *domain.User) error {
	// Validate basic fields (though userRepo usually trusts input or checks DB constraints)
	if user.Role != "" && !user.Role.IsValid() {
		return domain.ErrInvalidCredentials // Or ErrInvalidRole
	}
	// We can add logic to not allow update email if it already exists etc.
	// But AdminUpdateUser in repo currently doesn't update email.
	// If we want to allow email update, need to handle uniqueness check.
	// Based on repo implementation, email is NOT updated.

	return uc.userRepo.AdminUpdateUser(ctx, user)
}

func (uc *adminUserUseCase) DeleteUser(ctx context.Context, userID uuid.UUID) error {
	return uc.userRepo.Delete(ctx, userID)
}

func (uc *adminUserUseCase) UpdateUserRole(ctx context.Context, userID uuid.UUID, role domain.UserRole) error {
	// Validate role
	if !role.IsValid() {
		return domain.ErrInvalidCredentials // Or create ErrInvalidRole
	}

	return uc.userRepo.UpdateUserRole(ctx, userID, role)
}

func (uc *adminUserUseCase) ToggleUserStatus(ctx context.Context, userID uuid.UUID, isActive bool) error {
	return uc.userRepo.ToggleUserStatus(ctx, userID, isActive)
}
