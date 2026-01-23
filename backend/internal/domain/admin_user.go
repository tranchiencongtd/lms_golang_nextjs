package domain

import (
	"context"

	"github.com/google/uuid"
)

// Admin-specific user operations
type AdminUserUseCase interface {
	ListUsers(ctx context.Context, page, limit int, search string, role *UserRole) (*PaginatedUsers, error)
	CreateUser(ctx context.Context, user *User, password string) error
	UpdateUser(ctx context.Context, user *User) error
	DeleteUser(ctx context.Context, userID uuid.UUID) error
	UpdateUserRole(ctx context.Context, userID uuid.UUID, role UserRole) error
	ToggleUserStatus(ctx context.Context, userID uuid.UUID, isActive bool) error
}

type PaginatedUsers struct {
	Users      []*User `json:"users"`
	Total      int64   `json:"total"`
	Page       int     `json:"page"`
	Limit      int     `json:"limit"`
	TotalPages int     `json:"total_pages"`
}
