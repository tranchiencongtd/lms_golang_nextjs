package handler

import (
	"math"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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

// ListRequests handles listing consultation requests
// @Summary List consultation requests
// @Tags admin/consultations
// @Accept json
// @Produce json
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} response.Response
// @Router /api/v1/admin/consultations [get]
func (h *ConsultationHandler) ListRequests(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	requests, total, err := h.consultationUseCase.ListRequests(c.Request.Context(), page, pageSize)
	if err != nil {
		response.InternalServerError(c, "Lỗi khi lấy danh sách")
		return
	}

	response.OK(c, "Thành công", gin.H{
		"items": requests,
		"pagination": gin.H{
			"page":        page,
			"page_size":   pageSize,
			"total":       total,
			"total_pages": int(math.Ceil(float64(total) / float64(pageSize))),
		},
	})
}

// UpdateRequest handles updating a consultation request
// @Summary Update consultation request
// @Tags admin/consultations
// @Accept json
// @Produce json
// @Param id path string true "Requests ID"
// @Param body body object true "Update data"
// @Success 200 {object} response.Response
// @Router /api/v1/admin/consultations/{id} [put]
func (h *ConsultationHandler) UpdateRequest(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "ID không hợp lệ")
		return
	}

	var req struct {
		Status string `json:"status"`
		Note   string `json:"note"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Dữ liệu không hợp lệ")
		return
	}

	err = h.consultationUseCase.UpdateRequest(c.Request.Context(), id, req.Status, req.Note)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.OK(c, "Cập nhật thành công", nil)
}

// DeleteRequest handles deleting a consultation request
// @Summary Delete consultation request
// @Tags admin/consultations
// @Param id path string true "Requests ID"
// @Success 200 {object} response.Response
// @Router /api/v1/admin/consultations/{id} [delete]
func (h *ConsultationHandler) DeleteRequest(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "ID không hợp lệ")
		return
	}

	err = h.consultationUseCase.DeleteRequest(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.OK(c, "Xóa thành công", nil)
}
