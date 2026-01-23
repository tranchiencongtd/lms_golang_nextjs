package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/mathvn/backend/internal/delivery/http/response"
	"github.com/mathvn/backend/internal/domain"
)

type ConsultationHandler struct {
	consultationUseCase domain.ConsultationUseCase
}

func NewConsultationHandler(consultationUseCase domain.ConsultationUseCase) *ConsultationHandler {
	return &ConsultationHandler{
		consultationUseCase: consultationUseCase,
	}
}

// CreateRequest handles creating a new consultation request
// @Summary Create consultation request
// @Description Create a new consultation request
// @Tags consultations
// @Accept json
// @Produce json
// @Param request body domain.CreateConsultationRequest true "Consultation Request"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Router /api/v1/consultations [post]
func (h *ConsultationHandler) CreateRequest(c *gin.Context) {
	var req domain.CreateConsultationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Dữ liệu không hợp lệ")
		return
	}

	err := h.consultationUseCase.CreateRequest(c.Request.Context(), &req)
	if err != nil {
		response.InternalServerError(c, "Đã xảy ra lỗi khi tạo yêu cầu tư vấn")
		return
	}

	response.OK(c, "Gửi yêu cầu tư vấn thành công", nil)
}
