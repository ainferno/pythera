package server

import (
	"github.com/labstack/echo/v4"
	em "github.com/labstack/echo/v4/middleware"

	"therapy-backend/internal/config"
	"therapy-backend/internal/handlers"
	appmw "therapy-backend/internal/middleware"
	"therapy-backend/internal/service"
)

type Deps struct {
	Cfg      *config.Config
	Auth     *service.AuthService
	AuthH    *handlers.AuthHandler
	Slots    *handlers.SlotsHandler
	Bookings *handlers.BookingsHandler
	Admin    *handlers.AdminHandler
}

func New(d *Deps) *echo.Echo {
	e := echo.New()
	e.HideBanner = true

	e.Use(em.Logger())
	e.Use(em.Recover())
	e.Use(em.CORSWithConfig(em.CORSConfig{
		AllowOrigins:     []string{d.Cfg.FrontendOrigin},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAuthorization},
		AllowMethods:     []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.OPTIONS},
		AllowCredentials: true,
	}))

	api := e.Group("/api")
	api.GET("/health", func(c echo.Context) error { return c.String(200, "ok") })

	// public
	api.POST("/auth/register", d.AuthH.Register)
	api.POST("/auth/login", d.AuthH.Login)
	api.GET("/slots", d.Slots.List)

	// authenticated
	auth := api.Group("", appmw.JWT(d.Auth))
	auth.GET("/me", d.AuthH.Me)
	auth.POST("/bookings", d.Bookings.Create)
	auth.GET("/bookings/mine", d.Bookings.Mine)
	auth.POST("/bookings/:id/cancel", d.Bookings.Cancel)
	auth.POST("/bookings/:id/reschedule", d.Bookings.Reschedule)

	// admin
	admin := api.Group("/admin", appmw.JWT(d.Auth), appmw.AdminOnly)
	admin.GET("/bookings", d.Admin.ListBookings)
	admin.POST("/bookings/:id/confirm", d.Admin.ConfirmBooking)
	admin.GET("/schedule/templates", d.Admin.ListTemplates)
	admin.POST("/schedule/templates", d.Admin.CreateTemplate)
	admin.DELETE("/schedule/templates/:id", d.Admin.DeleteTemplate)
	admin.GET("/schedule/blocks", d.Admin.ListBlocks)
	admin.POST("/schedule/blocks", d.Admin.CreateBlock)
	admin.DELETE("/schedule/blocks/:id", d.Admin.DeleteBlock)

	return e
}
