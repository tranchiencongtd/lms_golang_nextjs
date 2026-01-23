package usecase

import (
	"context"

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
