package domain

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrConsultationRequestNotFound = errors.New("consultation request not found")
)

type ConsultationRequest struct {
	ID            uuid.UUID `json:"id"`
	StudentName   string    `json:"student_name"`
	ParentName    string    `json:"parent_name"`
	Phone         string    `json:"phone"`
	BirthYear     int       `json:"birth_year"`
	Grade         string    `json:"grade"`
	AcademicLevel string    `json:"academic_level"`
	Status        string    `json:"status"` // pending, contacted, completed
	Note          string    `json:"note"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type CreateConsultationRequest struct {
	StudentName   string `json:"student_name" binding:"required"`
	ParentName    string `json:"parent_name" binding:"required"`
	Phone         string `json:"phone" binding:"required"`
	BirthYear     int    `json:"birth_year" binding:"required"`
	Grade         string `json:"grade" binding:"required"`
	AcademicLevel string `json:"academic_level" binding:"required"`
}

type ConsultationRepository interface {
	Create(ctx context.Context, req *ConsultationRequest) error
	GetByID(ctx context.Context, id uuid.UUID) (*ConsultationRequest, error)
}

type ConsultationUseCase interface {
	CreateRequest(ctx context.Context, req *CreateConsultationRequest) error
}
