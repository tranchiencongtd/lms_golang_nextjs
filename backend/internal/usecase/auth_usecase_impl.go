package usecase

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
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
	userRepo         repository.UserRepository
	refreshTokenRepo repository.RefreshTokenRepository
	jwtConfig        config.JWTConfig
	bcryptCost       int
}

// NewAuthUseCase creates a new auth use case
func NewAuthUseCase(
	userRepo repository.UserRepository,
	refreshTokenRepo repository.RefreshTokenRepository,
	jwtConfig config.JWTConfig,
	bcryptCost int,
) AuthUseCase {
	return &authUseCase{
		userRepo:         userRepo,
		refreshTokenRepo: refreshTokenRepo,
		jwtConfig:        jwtConfig,
		bcryptCost:       bcryptCost,
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

	// Generate access and refresh tokens
	accessToken, expiresIn, err := uc.generateAccessToken(user.ID)
	if err != nil {
		return nil, err
	}

	refreshToken, err := uc.generateRefreshToken(ctx, user.ID)
	if err != nil {
		return nil, err
	}

	return &AuthOutput{
		User:         user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    expiresIn,
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

	// Generate access and refresh tokens
	accessToken, expiresIn, err := uc.generateAccessToken(user.ID)
	if err != nil {
		return nil, err
	}

	refreshToken, err := uc.generateRefreshToken(ctx, user.ID)
	if err != nil {
		return nil, err
	}

	return &AuthOutput{
		User:         user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    expiresIn,
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

// ValidateToken validates a JWT access token and returns the user ID
func (uc *authUseCase) ValidateToken(tokenString string) (uuid.UUID, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, domain.ErrInvalidToken
		}
		return []byte(uc.jwtConfig.AccessTokenSecret), nil
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

// generateAccessToken generates a JWT access token for the user
func (uc *authUseCase) generateAccessToken(userID uuid.UUID) (string, int64, error) {
	expiresAt := time.Now().Add(uc.jwtConfig.AccessTokenExpiryTime)
	expiresIn := int64(uc.jwtConfig.AccessTokenExpiryTime.Seconds())

	claims := jwt.MapClaims{
		"sub": userID.String(),
		"exp": expiresAt.Unix(),
		"iat": time.Now().Unix(),
		"type": "access",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(uc.jwtConfig.AccessTokenSecret))
	if err != nil {
		return "", 0, err
	}

	return tokenString, expiresIn, nil
}

// generateRefreshToken generates a refresh token and stores it in the database
func (uc *authUseCase) generateRefreshToken(ctx context.Context, userID uuid.UUID) (string, error) {
	// Generate JWT refresh token
	expiresAt := time.Now().Add(uc.jwtConfig.RefreshTokenExpiryTime)

	claims := jwt.MapClaims{
		"sub": userID.String(),
		"exp": expiresAt.Unix(),
		"iat": time.Now().Unix(),
		"type": "refresh",
		"jti": uuid.New().String(), // JWT ID for token tracking
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(uc.jwtConfig.RefreshTokenSecret))
	if err != nil {
		return "", err
	}

	// Hash the token before storing
	tokenHash := uc.hashRefreshToken(tokenString)

	// Store refresh token in database
	refreshToken := &domain.RefreshToken{
		UserID:    userID,
		TokenHash: tokenHash,
		ExpiresAt: expiresAt,
		IsRevoked: false,
	}

	if err := uc.refreshTokenRepo.Create(ctx, refreshToken); err != nil {
		return "", err
	}

	return tokenString, nil
}

// hashRefreshToken hashes a refresh token using SHA256
func (uc *authUseCase) hashRefreshToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

// RefreshToken generates a new access token using a refresh token
func (uc *authUseCase) RefreshToken(ctx context.Context, input *RefreshTokenInput) (*AuthOutput, error) {
	// Parse and validate refresh token
	token, err := jwt.Parse(input.RefreshToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, domain.ErrInvalidRefreshToken
		}
		return []byte(uc.jwtConfig.RefreshTokenSecret), nil
	})

	if err != nil {
		return nil, domain.ErrInvalidRefreshToken
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, domain.ErrInvalidRefreshToken
	}

	// Check token type
	tokenType, ok := claims["type"].(string)
	if !ok || tokenType != "refresh" {
		return nil, domain.ErrInvalidRefreshToken
	}

	// Check expiration
	exp, ok := claims["exp"].(float64)
	if !ok || time.Now().Unix() > int64(exp) {
		return nil, domain.ErrRefreshTokenExpired
	}

	// Get user ID from claims
	userIDStr, ok := claims["sub"].(string)
	if !ok {
		return nil, domain.ErrInvalidRefreshToken
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, domain.ErrInvalidRefreshToken
	}

	// Verify refresh token exists in database and is valid
	tokenHash := uc.hashRefreshToken(input.RefreshToken)
	storedToken, err := uc.refreshTokenRepo.GetByTokenHash(ctx, tokenHash)
	if err != nil {
		return nil, domain.ErrInvalidRefreshToken
	}

	// Check if token is revoked or expired
	if !storedToken.IsValid() {
		if storedToken.IsRevoked {
			return nil, domain.ErrRefreshTokenRevoked
		}
		return nil, domain.ErrRefreshTokenExpired
	}

	// Verify user ID matches
	if storedToken.UserID != userID {
		return nil, domain.ErrInvalidRefreshToken
	}

	// Get user
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Check if user is active
	if !user.IsActive {
		return nil, domain.ErrUserNotActive
	}

	// Generate new access token
	accessToken, expiresIn, err := uc.generateAccessToken(userID)
	if err != nil {
		return nil, err
	}

	// Optionally rotate refresh token (best practice: generate new refresh token)
	// For now, we'll keep the same refresh token, but you can implement rotation if needed
	newRefreshToken, err := uc.generateRefreshToken(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Revoke old refresh token
	if err := uc.refreshTokenRepo.Revoke(ctx, tokenHash); err != nil {
		// Log error but don't fail the request
		_ = err
	}

	return &AuthOutput{
		User:         user,
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		ExpiresIn:    expiresIn,
	}, nil
}

// Logout revokes a refresh token
func (uc *authUseCase) Logout(ctx context.Context, refreshToken string) error {
	tokenHash := uc.hashRefreshToken(refreshToken)
	return uc.refreshTokenRepo.Revoke(ctx, tokenHash)
}

// LogoutAll revokes all refresh tokens for a user
func (uc *authUseCase) LogoutAll(ctx context.Context, userID uuid.UUID) error {
	return uc.refreshTokenRepo.RevokeAllForUser(ctx, userID)
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
