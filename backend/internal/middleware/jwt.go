package middleware

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"

	"therapy-backend/internal/service"
)

const (
	CtxUserID = "uid"
	CtxRole   = "role"
)

func JWT(auth *service.AuthService) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			h := c.Request().Header.Get("Authorization")
			if !strings.HasPrefix(h, "Bearer ") {
				return echo.NewHTTPError(http.StatusUnauthorized, "missing token")
			}
			tokenStr := strings.TrimPrefix(h, "Bearer ")
			claims, err := auth.ParseToken(tokenStr)
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid token")
			}
			c.Set(CtxUserID, claims.UserID)
			c.Set(CtxRole, claims.Role)
			return next(c)
		}
	}
}

func AdminOnly(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		role, _ := c.Get(CtxRole).(string)
		if role != "admin" {
			return echo.NewHTTPError(http.StatusForbidden, "admin only")
		}
		return next(c)
	}
}
