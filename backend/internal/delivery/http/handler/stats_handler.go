package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/mathvn/backend/internal/delivery/http/response"
	"github.com/mathvn/backend/internal/domain"
)

type StatsHandler struct {
	statsUseCase domain.StatsUseCase
}

func NewStatsHandler(statsUseCase domain.StatsUseCase) *StatsHandler {
	return &StatsHandler{
		statsUseCase: statsUseCase,
	}
}

// GetDashboardStats handles fetching dashboard statistics
// @Summary Get dashboard stats
// @Description Get dashboard overview statistics (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Success 200 {object} response.Response
// @Router /api/v1/admin/stats [get]
func (h *StatsHandler) GetDashboardStats(c *gin.Context) {
	stats, err := h.statsUseCase.GetDashboardStats()
	if err != nil {
		response.InternalServerError(c, "Failed to fetch dashboard stats")
		return
	}

	response.OK(c, "Dashboard stats fetched successfully", stats)
}
