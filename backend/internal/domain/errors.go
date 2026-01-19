package domain

import "errors"

var (
	// User errors
	ErrUserNotFound              = errors.New("user not found")
	ErrUserAlreadyExists         = errors.New("user already exists")
	ErrInvalidCredentials        = errors.New("invalid credentials")
	ErrUserNotActive             = errors.New("user not active")
	ErrInvalidEmail              = errors.New("invalid email")
	ErrInvalidPassword           = errors.New("invalid password")
	ErrInvalidPhoneNumber        = errors.New("invalid phone number")
	ErrPhoneNumberAlreadyExists  = errors.New("phone number already exists")

	// Token errors
	ErrInvalidToken              = errors.New("invalid token")
	ErrTokenExpired              = errors.New("token expired")
	ErrInvalidRefreshToken       = errors.New("invalid refresh token")
	ErrRefreshTokenExpired       = errors.New("refresh token expired")
	ErrRefreshTokenRevoked       = errors.New("refresh token revoked")

	// Course errors
	ErrCourseNotFound            = errors.New("course not found")
	ErrCourseAlreadyExists       = errors.New("course already exists")
	ErrInvalidCourseStatus       = errors.New("invalid course status")
	ErrInvalidCourseLevel        = errors.New("invalid course level")
	ErrCourseSectionNotFound     = errors.New("course section not found")
	ErrCourseLessonNotFound      = errors.New("course lesson not found")
)
