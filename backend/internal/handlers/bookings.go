package handlers

import (
	"errors"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"therapy-backend/internal/middleware"
	"therapy-backend/internal/models"
	"therapy-backend/internal/repository"
	"therapy-backend/internal/service"
)

type BookingsHandler struct {
	bookings *service.BookingService
	repo     *repository.BookingRepo
}

func NewBookingsHandler(b *service.BookingService, r *repository.BookingRepo) *BookingsHandler {
	return &BookingsHandler{bookings: b, repo: r}
}

type createBookingReq struct {
	SlotStart string  `json:"slot_start"`
	Notes     *string `json:"notes"`
}

func (h *BookingsHandler) Create(c echo.Context) error {
	uid, _ := c.Get(middleware.CtxUserID).(uuid.UUID)
	var req createBookingReq
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid payload")
	}
	t, err := time.Parse(time.RFC3339, req.SlotStart)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid slot_start (expect RFC3339)")
	}
	b, err := h.bookings.Create(c.Request().Context(), uid, t, req.Notes)
	if err != nil {
		if errors.Is(err, service.ErrSlotNotAvailable) {
			return echo.NewHTTPError(http.StatusConflict, "slot not available")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusCreated, b)
}

func (h *BookingsHandler) Mine(c echo.Context) error {
	uid, _ := c.Get(middleware.CtxUserID).(uuid.UUID)
	list, err := h.repo.ListByClient(c.Request().Context(), uid)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if list == nil {
		list = []models.Booking{}
	}
	return c.JSON(http.StatusOK, list)
}

func (h *BookingsHandler) Cancel(c echo.Context) error {
	uid, _ := c.Get(middleware.CtxUserID).(uuid.UUID)
	role, _ := c.Get(middleware.CtxRole).(string)
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "bad id")
	}
	b, err := h.bookings.Cancel(c.Request().Context(), id, uid, models.Role(role))
	if err != nil {
		return mapBookingErr(err)
	}
	return c.JSON(http.StatusOK, b)
}

type rescheduleReq struct {
	SlotStart string `json:"slot_start"`
}

func (h *BookingsHandler) Reschedule(c echo.Context) error {
	uid, _ := c.Get(middleware.CtxUserID).(uuid.UUID)
	role, _ := c.Get(middleware.CtxRole).(string)
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "bad id")
	}
	var req rescheduleReq
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid payload")
	}
	t, err := time.Parse(time.RFC3339, req.SlotStart)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "bad slot_start")
	}
	b, err := h.bookings.Reschedule(c.Request().Context(), id, uid, models.Role(role), t)
	if err != nil {
		return mapBookingErr(err)
	}
	return c.JSON(http.StatusOK, b)
}

func mapBookingErr(err error) *echo.HTTPError {
	switch {
	case errors.Is(err, service.ErrSlotNotAvailable):
		return echo.NewHTTPError(http.StatusConflict, "slot not available")
	case errors.Is(err, service.ErrForbidden):
		return echo.NewHTTPError(http.StatusForbidden, "forbidden")
	case errors.Is(err, service.ErrBadState):
		return echo.NewHTTPError(http.StatusBadRequest, "invalid booking state")
	case errors.Is(err, repository.ErrNotFound):
		return echo.NewHTTPError(http.StatusNotFound, "not found")
	default:
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
}
