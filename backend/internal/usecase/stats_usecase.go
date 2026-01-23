package usecase

import (
	"github.com/mathvn/backend/internal/domain"
)

type statsUseCase struct {
	statsRepo domain.StatsRepository
}

func NewStatsUseCase(statsRepo domain.StatsRepository) domain.StatsUseCase {
	return &statsUseCase{
		statsRepo: statsRepo,
	}
}

func (uc *statsUseCase) GetDashboardStats() (*domain.DashboardStats, error) {
	return uc.statsRepo.GetDashboardStats()
}
