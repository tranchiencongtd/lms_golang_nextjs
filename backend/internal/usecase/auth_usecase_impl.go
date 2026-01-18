package usecase

import (
	"context"
	"regexp"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/mathvn/backend/config"
	"github.com/mathvn/backend/internal/domain"
	"github.com/mathvn/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

// authUseCase implements AuthUseCase
type authUseCase struct {
	userRepo   repository.UserRepository
	jwtConfig  config.JWTConfig
	bcryptCost int
}

// NewAuthUseCase creates a new auth use case
func NewAuthUseCase(
	userRepo repository.UserRepository,
	jwtConfig config.JWTConfig,
	bcryptCost int,
) AuthUseCase {
	return &authUseCase{
		userRepo:   userRepo,
		jwtConfig:  jwtConfig,
		bcryptCost: bcryptCost,
	}
}

// Register creates a new user account
func (uc *authUseCase) Register(ctx context.Context, input *RegisterInput) (*AuthOutput, error) {
	// Validate email format
	if !isValidEmail(input.Email) {
		return nil, domain.ErrInvalidEmail
	}

	// Validate password length
	if len(input.Password) < 8 {
		return nil, domain.ErrInvalidPassword
	}

	// Validate phone number (required)
	if !isValidPhoneNumber(input.PhoneNumber) {
		return nil, domain.ErrInvalidPhoneNumber
	}
	phoneExists, err := uc.userRepo.ExistsByPhoneNumber(ctx, input.PhoneNumber)
	if err != nil {
		return nil, err
	}
	if phoneExists {
		return nil, domain.ErrPhoneNumberAlreadyExists
	}

	// Check if user already exists
	emailExists, err := uc.userRepo.ExistsByEmail(ctx, input.Email)
	if err != nil {
		return nil, err
	}
	if emailExists {
		return nil, domain.ErrUserAlreadyExists
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), uc.bcryptCost)
	if err != nil {
		return nil, err
	}

	// Create user
	user := &domain.User{
		Email:        input.Email,
		PasswordHash: string(hashedPassword),
		FullName:     input.FullName,
		PhoneNumber:  input.PhoneNumber,
		Role:         domain.RoleStudent, // Default role
		IsActive:     true,
		IsVerified:   false, // Require email verification
	}

	if err := uc.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	// Generate JWT token
	token, expiresIn, err := uc.generateToken(user.ID)
	if err != nil {
		return nil, err
	}

	return &AuthOutput{
		User:        user,
		AccessToken: token,
		ExpiresIn:   expiresIn,
	}, nil
}

// Login authenticates a user and returns tokens
func (uc *authUseCase) Login(ctx context.Context, input *LoginInput) (*AuthOutput, error) {
	var user *domain.User
	var err error

	// Determine if input is email or phone number
	if isValidEmail(input.EmailOrPhone) {
		// Login with email
		user, err = uc.userRepo.GetByEmail(ctx, input.EmailOrPhone)
	} else if isValidPhoneNumber(input.EmailOrPhone) {
		// Login with phone number
		user, err = uc.userRepo.GetByPhoneNumber(ctx, input.EmailOrPhone)
	} else {
		return nil, domain.ErrInvalidCredentials
	}

	if err != nil {
		if err == domain.ErrUserNotFound {
			return nil, domain.ErrInvalidCredentials
		}
		return nil, err
	}

	// Check if user is active
	if !user.IsActive {
		return nil, domain.ErrUserNotActive
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		return nil, domain.ErrInvalidCredentials
	}

	// Generate JWT token
	token, expiresIn, err := uc.generateToken(user.ID)
	if err != nil {
		return nil, err
	}

	return &AuthOutput{
		User:        user,
		AccessToken: token,
		ExpiresIn:   expiresIn,
	}, nil
}

// GetProfile retrieves the current user's profile
func (uc *authUseCase) GetProfile(ctx context.Context, userID uuid.UUID) (*UserOutput, error) {
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	return &UserOutput{
		ID:          user.ID,
		Email:       user.Email,
		FullName:    user.FullName,
		Avatar:      user.Avatar,
		PhoneNumber: user.PhoneNumber,
		Role:        user.Role,
		IsVerified:  user.IsVerified,
	}, nil
}

// ValidateToken validates a JWT token and returns the user ID
func (uc *authUseCase) ValidateToken(tokenString string) (uuid.UUID, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, domain.ErrInvalidToken
		}
		return []byte(uc.jwtConfig.Secret), nil
	})

	if err != nil {
		return uuid.Nil, domain.ErrInvalidToken
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return uuid.Nil, domain.ErrInvalidToken
	}

	// Check expiration
	exp, ok := claims["exp"].(float64)
	if !ok || time.Now().Unix() > int64(exp) {
		return uuid.Nil, domain.ErrTokenExpired
	}

	// Get user ID from claims
	userIDStr, ok := claims["sub"].(string)
	if !ok {
		return uuid.Nil, domain.ErrInvalidToken
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return uuid.Nil, domain.ErrInvalidToken
	}

	return userID, nil
}

// generateToken generates a JWT token for the user
func (uc *authUseCase) generateToken(userID uuid.UUID) (string, int64, error) {
	expiresAt := time.Now().Add(uc.jwtConfig.ExpiryTime)
	expiresIn := int64(uc.jwtConfig.ExpiryTime.Seconds())

	claims := jwt.MapClaims{
		"sub": userID.String(),
		"exp": expiresAt.Unix(),
		"iat": time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(uc.jwtConfig.Secret))
	if err != nil {
		return "", 0, err
	}

	return tokenString, expiresIn, nil
}

// isValidEmail validates email format
func isValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// isValidPhoneNumber validates phone number format (simple validation for Vietnamese phone numbers)
func isValidPhoneNumber(phone string) bool {
	// Vietnamese phone number: starts with 0, 10-11 digits
	// Examples: 0901234567, 0123456789, 84901234567
	phoneRegex := regexp.MustCompile(`^(0|\+84)[0-9]{9,10}$`)
	return phoneRegex.MatchString(phone)
}
