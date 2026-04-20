package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"therapy-backend/internal/models"
)

var ErrNotFound = errors.New("not found")

type UserRepo struct{ db *pgxpool.Pool }

func NewUserRepo(db *pgxpool.Pool) *UserRepo { return &UserRepo{db: db} }

const userCols = `id, email, password_hash, full_name, phone, role, created_at, updated_at`

func scanUser(row pgx.Row, u *models.User) error {
	return row.Scan(&u.ID, &u.Email, &u.PasswordHash, &u.FullName, &u.Phone, &u.Role, &u.CreatedAt, &u.UpdatedAt)
}

func (r *UserRepo) Create(ctx context.Context, email, hash, fullName string, phone *string, role models.Role) (*models.User, error) {
	u := &models.User{}
	err := scanUser(r.db.QueryRow(ctx, `
        INSERT INTO users (email, password_hash, full_name, phone, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING `+userCols, email, hash, fullName, phone, role), u)
	return u, err
}

func (r *UserRepo) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	u := &models.User{}
	err := scanUser(r.db.QueryRow(ctx, `SELECT `+userCols+` FROM users WHERE email = $1`, email), u)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return u, err
}

func (r *UserRepo) FindByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	u := &models.User{}
	err := scanUser(r.db.QueryRow(ctx, `SELECT `+userCols+` FROM users WHERE id = $1`, id), u)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return u, err
}

func (r *UserRepo) GetAdmin(ctx context.Context) (*models.User, error) {
	u := &models.User{}
	err := scanUser(r.db.QueryRow(ctx, `
        SELECT `+userCols+` FROM users WHERE role = 'admin'
        ORDER BY created_at ASC LIMIT 1`), u)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return u, err
}

func (r *UserRepo) PromoteToAdmin(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `UPDATE users SET role='admin', updated_at=now() WHERE id=$1`, id)
	return err
}
