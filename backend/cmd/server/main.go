package main

import (
	"context"
	"errors"
	"log/slog"
	"os"
	"strings"

	"golang.org/x/crypto/bcrypt"

	"therapy-backend/internal/config"
	"therapy-backend/internal/database"
	"therapy-backend/internal/handlers"
	"therapy-backend/internal/models"
	"therapy-backend/internal/repository"
	"therapy-backend/internal/server"
	"therapy-backend/internal/service"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))

	cfg, err := config.Load()
	if err != nil {
		slog.Error("config load", "err", err)
		os.Exit(1)
	}

	migrationsPath := os.Getenv("MIGRATIONS_PATH")
	if migrationsPath == "" {
		migrationsPath = "./migrations"
	}
	if err := database.Migrate(cfg.DatabaseURL, migrationsPath); err != nil {
		slog.Error("migrate", "err", err)
		os.Exit(1)
	}

	ctx := context.Background()
	pool, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		slog.Error("db connect", "err", err)
		os.Exit(1)
	}
	defer pool.Close()

	userRepo := repository.NewUserRepo(pool)
	schedRepo := repository.NewScheduleRepo(pool)
	bookRepo := repository.NewBookingRepo(pool)

	if err := bootstrapAdmin(ctx, userRepo, cfg); err != nil {
		slog.Error("bootstrap admin", "err", err)
		os.Exit(1)
	}

	mail := service.NewMailService(cfg.SMTP.Host, cfg.SMTP.Port, cfg.SMTP.User, cfg.SMTP.Password, cfg.SMTP.From, cfg.ClinicTZ)
	auth := service.NewAuthService(userRepo, cfg.JWTSecret, cfg.JWTExpiry)
	sched := service.NewScheduleService(schedRepo, bookRepo, cfg.ClinicTZ)
	booking := service.NewBookingService(bookRepo, userRepo, sched, mail)

	e := server.New(&server.Deps{
		Cfg:      cfg,
		Auth:     auth,
		AuthH:    handlers.NewAuthHandler(auth, userRepo),
		Slots:    handlers.NewSlotsHandler(sched, userRepo, cfg.SlotsLookaheadDays),
		Bookings: handlers.NewBookingsHandler(booking, bookRepo),
		Admin:    handlers.NewAdminHandler(bookRepo, booking, schedRepo, userRepo),
	})

	slog.Info("starting server", "port", cfg.ServerPort, "tz", cfg.ClinicTZ.String())
	if err := e.Start(":" + cfg.ServerPort); err != nil {
		slog.Error("server", "err", err)
		os.Exit(1)
	}
}

func bootstrapAdmin(ctx context.Context, repo *repository.UserRepo, cfg *config.Config) error {
	if _, err := repo.GetAdmin(ctx); err == nil {
		return nil
	} else if !errors.Is(err, repository.ErrNotFound) {
		return err
	}
	if cfg.AdminPassword == "" {
		slog.Warn("no admin user found and ADMIN_PASSWORD not set; skipping bootstrap")
		return nil
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(cfg.AdminPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	email := strings.ToLower(strings.TrimSpace(cfg.AdminEmail))
	u, err := repo.Create(ctx, email, string(hash), cfg.AdminFullName, nil, models.RoleAdmin)
	if err != nil {
		return err
	}
	slog.Info("bootstrap admin created", "id", u.ID, "email", u.Email)
	return nil
}
