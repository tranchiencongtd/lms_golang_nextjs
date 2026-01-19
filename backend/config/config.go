package config

import (
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the application
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	Bcrypt   BcryptConfig
}

type ServerConfig struct {
	Port string
	Mode string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type JWTConfig struct {
	AccessTokenSecret      string
	AccessTokenExpiryTime  time.Duration
	RefreshTokenSecret     string
	RefreshTokenExpiryTime time.Duration
}

type BcryptConfig struct {
	Cost int
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	// Load .env file if exists
	_ = godotenv.Load(".env.dev")

	// Access token expiry (default: 15 minutes)
	accessTokenExpiryMinutes, err := strconv.Atoi(getEnv("JWT_ACCESS_TOKEN_EXPIRY_MINUTES", "15"))
	if err != nil {
		accessTokenExpiryMinutes = 15
	}

	// Refresh token expiry (default: 7 days)
	refreshTokenExpiryDays, err := strconv.Atoi(getEnv("JWT_REFRESH_TOKEN_EXPIRY_DAYS", "7"))
	if err != nil {
		refreshTokenExpiryDays = 7
	}

	bcryptCost, err := strconv.Atoi(getEnv("BCRYPT_COST", "10"))
	if err != nil {
		bcryptCost = 10
	}

	return &Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
			Mode: getEnv("SERVER_MODE", "development"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "123456"),
			DBName:   getEnv("DB_NAME", "mathvn_db"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		JWT: JWTConfig{
			AccessTokenSecret:      getEnv("JWT_ACCESS_TOKEN_SECRET", "default-access-secret-key"),
			AccessTokenExpiryTime:  time.Duration(accessTokenExpiryMinutes) * time.Minute,
			RefreshTokenSecret:     getEnv("JWT_REFRESH_TOKEN_SECRET", "default-refresh-secret-key"),
			RefreshTokenExpiryTime: time.Duration(refreshTokenExpiryDays) * 24 * time.Hour,
		},
		Bcrypt: BcryptConfig{
			Cost: bcryptCost,
		},
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// GetDSN returns PostgreSQL connection string
func (d *DatabaseConfig) GetDSN() string {
	return "host=" + d.Host +
		" port=" + d.Port +
		" user=" + d.User +
		" password=" + d.Password +
		" dbname=" + d.DBName +
		" sslmode=" + d.SSLMode
}
