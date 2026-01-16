package domain

import "errors"

// Common domain errors
var (
	// User errors
	ErrUserNotFound       = errors.New("user not found")
	ErrUserAlreadyExists  = errors.New("user with this email already exists")
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrUserNotActive      = errors.New("user account is not active")
	ErrUserNotVerified    = errors.New("user account is not verified")

	// Validation errors
	ErrInvalidEmail    = errors.New("invalid email format")
	ErrInvalidPassword = errors.New("password must be at least 8 characters")
	ErrInvalidRole     = errors.New("invalid user role")

	// Token errors
	ErrInvalidToken = errors.New("invalid or expired token")
	ErrTokenExpired = errors.New("token has expired")
)
