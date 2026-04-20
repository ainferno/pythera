package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerPort         string
	DatabaseURL        string
	JWTSecret          []byte
	JWTExpiry          time.Duration
	FrontendOrigin     string
	AdminEmail         string
	AdminPassword      string // bootstrap admin if no admin exists
	AdminFullName      string
	ClinicTZ           *time.Location
	SlotMinutes        int
	SlotsLookaheadDays int
	SMTP               SMTPConfig
}

type SMTPConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	From     string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	required := []string{"DB_USER", "DB_PASSWORD", "DB_NAME", "JWT_SECRET", "ADMIN_EMAIL"}
	for _, k := range required {
		if os.Getenv(k) == "" {
			return nil, fmt.Errorf("required env var %s is missing", k)
		}
	}

	tzName := getEnv("CLINIC_TZ", "UTC")
	loc, err := time.LoadLocation(tzName)
	if err != nil {
		return nil, fmt.Errorf("invalid CLINIC_TZ %q: %w", tzName, err)
	}

	expiryH, err := strconv.Atoi(getEnv("JWT_EXPIRY_HOURS", "168"))
	if err != nil || expiryH <= 0 {
		return nil, fmt.Errorf("invalid JWT_EXPIRY_HOURS")
	}
	slotMin, err := strconv.Atoi(getEnv("SLOT_MINUTES", "60"))
	if err != nil || slotMin <= 0 {
		return nil, fmt.Errorf("invalid SLOT_MINUTES")
	}
	lookahead, err := strconv.Atoi(getEnv("SLOTS_LOOKAHEAD_DAYS", "60"))
	if err != nil || lookahead <= 0 {
		return nil, fmt.Errorf("invalid SLOTS_LOOKAHEAD_DAYS")
	}
	smtpPort, _ := strconv.Atoi(getEnv("SMTP_PORT", "587"))

	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_PORT", "5432"),
		os.Getenv("DB_NAME"),
	)

	return &Config{
		ServerPort:         getEnv("SERVER_PORT", "8080"),
		DatabaseURL:        dsn,
		JWTSecret:          []byte(os.Getenv("JWT_SECRET")),
		JWTExpiry:          time.Duration(expiryH) * time.Hour,
		FrontendOrigin:     getEnv("FRONTEND_ORIGIN", "http://localhost:5173"),
		AdminEmail:         os.Getenv("ADMIN_EMAIL"),
		AdminPassword:      os.Getenv("ADMIN_PASSWORD"),
		AdminFullName:      getEnv("ADMIN_FULL_NAME", "Психолог"),
		ClinicTZ:           loc,
		SlotMinutes:        slotMin,
		SlotsLookaheadDays: lookahead,
		SMTP: SMTPConfig{
			Host:     os.Getenv("SMTP_HOST"),
			Port:     smtpPort,
			User:     os.Getenv("SMTP_USER"),
			Password: os.Getenv("SMTP_PASSWORD"),
			From:     os.Getenv("SMTP_FROM"),
		},
	}, nil
}

func getEnv(k, def string) string {
	if v, ok := os.LookupEnv(k); ok && v != "" {
		return v
	}
	return def
}
