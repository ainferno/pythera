package handlers

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"therapy-backend/internal/middleware"
	"therapy-backend/internal/models"
	"therapy-backend/internal/repository"
	"therapy-backend/internal/service"
)

type AdminHandler struct {
	bookingsRepo *repository.BookingRepo
	bookings     *service.BookingService
	sched        *repository.ScheduleRepo
	users        *repository.UserRepo
}

func NewAdminHandler(br *repository.BookingRepo, bs *service.BookingService, s *repository.ScheduleRepo, u *repository.UserRepo) *AdminHandler {
	return &AdminHandler{bookingsRepo: br, bookings: bs, sched: s, users: u}
}

// ===== bookings =====

func (h *AdminHandler) ListBookings(c echo.Context) error {
	uid, _ := c.Get(middleware.CtxUserID).(uuid.UUID)
	var status *models.BookingStatus
	if s := c.QueryParam("status"); s != "" {
		st := models.BookingStatus(s)
		status = &st
	}
	list, err := h.bookingsRepo.ListByAdmin(c.Request().Context(), uid, status)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if list == nil {
		list = []models.Booking{}
	}
	return c.JSON(http.StatusOK, list)
}

type confirmReq struct {
	AdminNotes *string `json:"admin_notes"`
}

func (h *AdminHandler) ConfirmBooking(c echo.Context) error {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "bad id")
	}
	var req confirmReq
	_ = c.Bind(&req)
	b, err := h.bookings.Confirm(c.Request().Context(), id, req.AdminNotes)
	if err != nil {
		return mapBookingErr(err)
	}
	return c.JSON(http.StatusOK, b)
}

// ===== schedule templates =====

type templateReq struct {
	Weekday     int    `json:"weekday"`
	StartTime   string `json:"start_time"`
	EndTime     string `json:"end_time"`
	SlotMinutes int    `json:"slot_minutes"`
	IsActive    bool   `json:"is_active"`
}

func (h *AdminHandler) ListTemplates(c echo.Context) error {
	uid, _ := c.Get(middleware.CtxUserID).(uuid.UUID)
	list, err := h.sched.ListTemplates(c.Request().Context(), uid)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if list == nil {
		list = []models.ScheduleTemplate{}
	}
	return c.JSON(http.StatusOK, list)
}

func (h *AdminHandler) CreateTemplate(c echo.Context) error {
	uid, _ := c.Get(middleware.CtxUserID).(uuid.UUID)
	var req templateReq
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid payload")
	}
	if req.Weekday < 0 || req.Weekday > 6 || req.SlotMinutes <= 0 {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid fields")
	}
	t := &models.ScheduleTemplate{
		AdminID:     uid,
		Weekday:     req.Weekday,
		StartTime:   req.StartTime,
		EndTime:     req.EndTime,
		SlotMinutes: req.SlotMinutes,
		IsActive:    req.IsActive,
	}
	if err := h.sched.CreateTemplate(c.Request().Context(), t); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusCreated, t)
}

func (h *AdminHandler) DeleteTemplate(c echo.Context) error {
	uid, _ := c.Get(middleware.CtxUserID).(uuid.UUID)
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "bad id")
	}
	if err := h.sched.DeleteTemplate(c.Request().Context(), uid, id); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.NoContent(http.StatusNoContent)
}

// ===== schedule blocks =====

type blockReq struct {
	StartsAt string  `json:"starts_at"`
	EndsAt   string  `json:"ends_at"`
	Reason   *string `json:"reason"`
}

func (h *AdminHandler) ListBlocks(c echo.Context) error {
	uid, _ := c.Get(middleware.CtxUserID).(uuid.UUID)
	from := time.Now().AddDate(-1, 0, 0)
	to := time.Now().AddDate(1, 0, 0)
	list, err := h.sched.ListBlocks(c.Request().Context(), uid, from, to)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if list == nil {
		list = []models.ScheduleBlock{}
	}
	return c.JSON(http.StatusOK, list)
}

func (h *AdminHandler) CreateBlock(c echo.Context) error {
	uid, _ := c.Get(middleware.CtxUserID).(uuid.UUID)
	var req blockReq
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid payload")
	}
	starts, err := time.Parse(time.RFC3339, req.StartsAt)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "bad starts_at")
	}
	ends, err := time.Parse(time.RFC3339, req.EndsAt)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "bad ends_at")
	}
	b := &models.ScheduleBlock{AdminID: uid, StartsAt: starts, EndsAt: ends, Reason: req.Reason}
	if err := h.sched.CreateBlock(c.Request().Context(), b); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusCreated, b)
}

func (h *AdminHandler) DeleteBlock(c echo.Context) error {
	uid, _ := c.Get(middleware.CtxUserID).(uuid.UUID)
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "bad id")
	}
	if err := h.sched.DeleteBlock(c.Request().Context(), uid, id); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.NoContent(http.StatusNoContent)
}
