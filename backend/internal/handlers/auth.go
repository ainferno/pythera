package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"therapy-backend/internal/middleware"
	"therapy-backend/internal/repository"
	"therapy-backend/internal/service"
)

type AuthHandler struct {
	auth  *service.AuthService
	users *repository.UserRepo
}

func NewAuthHandler(a *service.AuthService, u *repository.UserRepo) *AuthHandler {
	return &AuthHandler{auth: a, users: u}
}

type registerReq struct {
	Email    string  `json:"email"`
	Password string  `json:"password"`
	FullName string  `json:"full_name"`
	Phone    *string `json:"phone"`
}

func (h *AuthHandler) Register(c echo.Context) error {
	var req registerReq
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid payload")
	}
	if !strings.Contains(req.Email, "@") || len(req.Password) < 8 || strings.TrimSpace(req.FullName) == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "email, full_name and password (8+) are required")
	}
	u, err := h.auth.Register(c.Request().Context(), req.Email, req.Password, req.FullName, req.Phone)
	if err != nil {
		if errors.Is(err, service.ErrEmailExists) {
			return echo.NewHTTPError(http.StatusConflict, "email already registered")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusCreated, u)
}

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) Login(c echo.Context) error {
	var req loginReq
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid payload")
	}
	u, token, err := h.auth.Login(c.Request().Context(), req.Email, req.Password)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid credentials")
	}
	return c.JSON(http.StatusOK, echo.Map{"token": token, "user": u})
}

func (h *AuthHandler) Me(c echo.Context) error {
	uid, _ := c.Get(middleware.CtxUserID).(uuid.UUID)
	u, err := h.users.FindByID(c.Request().Context(), uid)
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "user not found")
	}
	return c.JSON(http.StatusOK, u)
}
