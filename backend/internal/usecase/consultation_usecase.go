package usecase

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/domain"
)

type consultationUseCase struct {
	consultationRepo domain.ConsultationRepository
	timeout          context.Context // In real app, we handle timeout properly or use config
}

// NewConsultationUseCase creates a new consultation use case
func NewConsultationUseCase(consultationRepo domain.ConsultationRepository) domain.ConsultationUseCase {
	return &consultationUseCase{
		consultationRepo: consultationRepo,
	}
}

// CreateRequest creates a new consultation request
func (uc *consultationUseCase) CreateRequest(ctx context.Context, req *domain.CreateConsultationRequest) error {
	consultation := &domain.ConsultationRequest{
		StudentName:   req.StudentName,
		ParentName:    req.ParentName,
		Phone:         req.Phone,
		BirthYear:     req.BirthYear,
		Grade:         req.Grade,
		AcademicLevel: req.AcademicLevel,
	}

	return uc.consultationRepo.Create(ctx, consultation)
}

// ListRequests lists consultation requests
func (uc *consultationUseCase) ListRequests(ctx context.Context, page, pageSize int) ([]*domain.ConsultationRequest, int, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize
	return uc.consultationRepo.List(ctx, pageSize, offset)
}

// UpdateRequest updates a consultation request status and note
func (uc *consultationUseCase) UpdateRequest(ctx context.Context, id uuid.UUID, status string, note string) error {
	req, err := uc.consultationRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	req.Status = status
	req.Note = note
	req.UpdatedAt = time.Now()
	return uc.consultationRepo.Update(ctx, req)
}

// DeleteRequest deletes a consultation request
func (uc *consultationUseCase) DeleteRequest(ctx context.Context, id uuid.UUID) error {
	return uc.consultationRepo.Delete(ctx, id)
}
