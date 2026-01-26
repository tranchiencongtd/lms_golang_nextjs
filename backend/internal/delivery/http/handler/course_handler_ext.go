package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/mathvn/backend/internal/delivery/http/response"
	"github.com/mathvn/backend/internal/domain"
)

// Section handlers

// CreateSection handles creating a new section
// @Summary Create section
// @Tags admin/sections
// @Accept json
// @Produce json
// @Param body body domain.CourseSection true "Section data"
// @Success 201 {object} response.Response
// @Router /api/v1/admin/sections [post]
func (h *CourseHandler) CreateSection(c *gin.Context) {
	var req domain.CourseSection
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Dữ liệu không hợp lệ")
		return
	}

	err := h.courseUseCase.CreateSection(c.Request.Context(), &req)
	if err != nil {
		h.handleCourseError(c, err)
		return
	}

	response.Created(c, "Tạo chương học thành công", req)
}

// UpdateSection handles updating a section
// @Summary Update section
// @Tags admin/sections
// @Accept json
// @Produce json
// @Param id path string true "Section ID"
// @Param body body domain.CourseSection true "Section data"
// @Success 200 {object} response.Response
// @Router /api/v1/admin/sections/{id} [put]
func (h *CourseHandler) UpdateSection(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "ID chương học không hợp lệ")
		return
	}

	var req domain.CourseSection
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Dữ liệu không hợp lệ")
		return
	}
	req.ID = id

	err = h.courseUseCase.UpdateSection(c.Request.Context(), &req)
	if err != nil {
		h.handleCourseError(c, err)
		return
	}

	response.OK(c, "Cập nhật chương học thành công", req)
}

// DeleteSection handles deleting a section
// @Summary Delete section
// @Tags admin/sections
// @Param id path string true "Section ID"
// @Success 200 {object} response.Response
// @Router /api/v1/admin/sections/{id} [delete]
func (h *CourseHandler) DeleteSection(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "ID chương học không hợp lệ")
		return
	}

	err = h.courseUseCase.DeleteSection(c.Request.Context(), id)
	if err != nil {
		h.handleCourseError(c, err)
		return
	}

	response.OK(c, "Xóa chương học thành công", nil)
}

// Lesson handlers

// CreateLesson handles creating a new lesson
// @Summary Create lesson
// @Tags admin/lessons
// @Accept json
// @Produce json
// @Param body body domain.CourseLesson true "Lesson data"
// @Success 201 {object} response.Response
// @Router /api/v1/admin/lessons [post]
func (h *CourseHandler) CreateLesson(c *gin.Context) {
	var req domain.CourseLesson
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Dữ liệu không hợp lệ")
		return
	}

	err := h.courseUseCase.CreateLesson(c.Request.Context(), &req)
	if err != nil {
		h.handleCourseError(c, err)
		return
	}

	response.Created(c, "Tạo bài học thành công", req)
}

// UpdateLesson handles updating a lesson
// @Summary Update lesson
// @Tags admin/lessons
// @Accept json
// @Produce json
// @Param id path string true "Lesson ID"
// @Param body body domain.CourseLesson true "Lesson data"
// @Success 200 {object} response.Response
// @Router /api/v1/admin/lessons/{id} [put]
func (h *CourseHandler) UpdateLesson(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "ID bài học không hợp lệ")
		return
	}

	var req domain.CourseLesson
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Dữ liệu không hợp lệ")
		return
	}
	req.ID = id

	err = h.courseUseCase.UpdateLesson(c.Request.Context(), &req)
	if err != nil {
		h.handleCourseError(c, err)
		return
	}

	response.OK(c, "Cập nhật bài học thành công", req)
}

// DeleteLesson handles deleting a lesson
// @Summary Delete lesson
// @Tags admin/lessons
// @Param id path string true "Lesson ID"
// @Success 200 {object} response.Response
// @Router /api/v1/admin/lessons/{id} [delete]
func (h *CourseHandler) DeleteLesson(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "ID bài học không hợp lệ")
		return
	}

	err = h.courseUseCase.DeleteLesson(c.Request.Context(), id)
	if err != nil {
		h.handleCourseError(c, err)
		return
	}

	response.OK(c, "Xóa bài học thành công", nil)
}
