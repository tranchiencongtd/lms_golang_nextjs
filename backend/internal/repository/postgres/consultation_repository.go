package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/mathvn/backend/internal/domain"
)

type consultationRepository struct {
	db *pgxpool.Pool
}

// NewConsultationRepository creates a new consultation repository
func NewConsultationRepository(db *pgxpool.Pool) domain.ConsultationRepository {
	return &consultationRepository{db: db}
}

// Create creates a new consultation request
func (r *consultationRepository) Create(ctx context.Context, req *domain.ConsultationRequest) error {
	query := `
		INSERT INTO consultation_requests (
			id, student_name, parent_name, phone, birth_year, grade, academic_level, status, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	req.ID = uuid.New()
	now := time.Now()
	req.CreatedAt = now
	req.UpdatedAt = now
	req.Status = "pending"

	_, err := r.db.Exec(ctx, query,
		req.ID,
		req.StudentName,
		req.ParentName,
		req.Phone,
		req.BirthYear,
		req.Grade,
		req.AcademicLevel,
		req.Status,
		req.CreatedAt,
		req.UpdatedAt,
	)

	return err
}

// GetByID gets a consultation request by ID
func (r *consultationRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.ConsultationRequest, error) {
	query := `
		SELECT id, student_name, parent_name, phone, birth_year, grade, academic_level, status, note, created_at, updated_at
		FROM consultation_requests
		WHERE id = $1
	`

	var note *string
	req := &domain.ConsultationRequest{}

	err := r.db.QueryRow(ctx, query, id).Scan(
		&req.ID,
		&req.StudentName,
		&req.ParentName,
		&req.Phone,
		&req.BirthYear,
		&req.Grade,
		&req.AcademicLevel,
		&req.Status,
		&note, // Handle nullable note
		&req.CreatedAt,
		&req.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, domain.ErrConsultationRequestNotFound
		}
		return nil, err
	}

	if note != nil {
		req.Note = *note
	}

	return req, nil
}
