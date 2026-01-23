package postgres

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/domain"
)

// ListUsersWithPagination returns paginated list of users
func (r *userRepository) ListUsersWithPagination(ctx context.Context, page, limit int, search string, role *domain.UserRole) (*domain.PaginatedUsers, error) {
	offset := (page - 1) * limit

	// Build query with optional filters
	query := `
		SELECT id, email, full_name, phone_number, role, is_active, is_verified, created_at, updated_at
		FROM users
		WHERE 1=1
	`
	countQuery := `SELECT COUNT(*) FROM users WHERE 1=1`
	args := []interface{}{}
	argCount := 1

	// Add search filter
	if search != "" {
		searchPattern := "%" + search + "%"
		query += fmt.Sprintf(" AND (full_name ILIKE $%d OR email ILIKE $%d OR phone_number ILIKE $%d)", argCount, argCount, argCount)
		countQuery += fmt.Sprintf(" AND (full_name ILIKE $%d OR email ILIKE $%d OR phone_number ILIKE $%d)", argCount, argCount, argCount)
		args = append(args, searchPattern)
		argCount++
	}

	// Add role filter
	if role != nil {
		query += fmt.Sprintf(" AND role = $%d", argCount)
		countQuery += fmt.Sprintf(" AND role = $%d", argCount)
		args = append(args, string(*role))
		argCount++
	}

	// Get total count
	var total int64
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, err
	}

	// Add pagination
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d OFFSET $%d", argCount, argCount+1)
	args = append(args, limit, offset)

	// Execute query
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := []*domain.User{}
	for rows.Next() {
		user := &domain.User{}
		err := rows.Scan(
			&user.ID,
			&user.Email,
			&user.FullName,
			&user.PhoneNumber,
			&user.Role,
			&user.IsActive,
			&user.IsVerified,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	totalPages := int(total) / limit
	if int(total)%limit > 0 {
		totalPages++
	}

	return &domain.PaginatedUsers{
		Users:      users,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// UpdateUserRole updates a user's role
func (r *userRepository) UpdateUserRole(ctx context.Context, userID uuid.UUID, role domain.UserRole) error {
	query := `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.Exec(ctx, query, string(role), userID)
	return err
}

// AdminUpdateUser updates user details by admin
func (r *userRepository) AdminUpdateUser(ctx context.Context, user *domain.User) error {
	query := `
		UPDATE users 
		SET full_name = $1, phone_number = $2, role = $3, is_active = $4, is_verified = $5, updated_at = NOW() 
		WHERE id = $6
	`
	_, err := r.db.Exec(ctx, query,
		user.FullName,
		user.PhoneNumber,
		string(user.Role),
		user.IsActive,
		user.IsVerified,
		user.ID,
	)
	return err
}

// ToggleUserStatus activates or deactivates a user
func (r *userRepository) ToggleUserStatus(ctx context.Context, userID uuid.UUID, isActive bool) error {
	query := `UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.Exec(ctx, query, isActive, userID)
	return err
}
