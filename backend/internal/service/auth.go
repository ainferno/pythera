package service

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"therapy-backend/internal/models"
	"therapy-backend/internal/repository"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEmailExists        = errors.New("email already registered")
)

type AuthService struct {
	users     *repository.UserRepo
	jwtSecret []byte
	jwtExpiry time.Duration
}

func NewAuthService(users *repository.UserRepo, secret []byte, expiry time.Duration) *AuthService {
	return &AuthService{users: users, jwtSecret: secret, jwtExpiry: expiry}
}

type Claims struct {
	UserID uuid.UUID `json:"uid"`
	Role   string    `json:"role"`
	jwt.RegisteredClaims
}

func (s *AuthService) Register(ctx context.Context, email, password, fullName string, phone *string) (*models.User, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	if u, err := s.users.FindByEmail(ctx, email); err == nil && u != nil {
		return nil, ErrEmailExists
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	return s.users.Create(ctx, email, string(hash), fullName, phone, models.RoleClient)
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*models.User, string, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	u, err := s.users.FindByEmail(ctx, email)
	if err != nil {
		return nil, "", ErrInvalidCredentials
	}
	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)); err != nil {
		return nil, "", ErrInvalidCredentials
	}
	token, err := s.issueToken(u)
	if err != nil {
		return nil, "", err
	}
	return u, token, nil
}

func (s *AuthService) issueToken(u *models.User) (string, error) {
	now := time.Now()
	c := Claims{
		UserID: u.ID,
		Role:   string(u.Role),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(s.jwtExpiry)),
			IssuedAt:  jwt.NewNumericDate(now),
			Subject:   u.ID.String(),
		},
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, c)
	return t.SignedString(s.jwtSecret)
}

func (s *AuthService) ParseToken(tokenStr string) (*Claims, error) {
	t, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return s.jwtSecret, nil
	})
	if err != nil {
		return nil, err
	}
	c, ok := t.Claims.(*Claims)
	if !ok || !t.Valid {
		return nil, errors.New("invalid token")
	}
	return c, nil
}
