package handlers

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"

	"therapy-backend/internal/models"
	"therapy-backend/internal/repository"
	"therapy-backend/internal/service"
)

type SlotsHandler struct {
	sched         *service.ScheduleService
	users         *repository.UserRepo
	lookaheadDays int
}

func NewSlotsHandler(s *service.ScheduleService, u *repository.UserRepo, lookahead int) *SlotsHandler {
	return &SlotsHandler{sched: s, users: u, lookaheadDays: lookahead}
}

func (h *SlotsHandler) List(c echo.Context) error {
	admin, err := h.users.GetAdmin(c.Request().Context())
	if err != nil {
		return echo.NewHTTPError(http.StatusServiceUnavailable, "no admin configured")
	}
	now := time.Now()
	from := now
	to := now.AddDate(0, 0, h.lookaheadDays)
	if f := c.QueryParam("from"); f != "" {
		if t, err := time.Parse(time.RFC3339, f); err == nil {
			from = t
		}
	}
	if t := c.QueryParam("to"); t != "" {
		if tt, err := time.Parse(time.RFC3339, t); err == nil {
			to = tt
		}
	}
	slots, err := h.sched.AvailableSlots(c.Request().Context(), admin.ID, from, to)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if slots == nil {
		slots = []models.Slot{}
	}
	return c.JSON(http.StatusOK, slots)
}
