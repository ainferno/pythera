package repository

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"therapy-backend/internal/models"
)

type BookingRepo struct{ db *pgxpool.Pool }

func NewBookingRepo(db *pgxpool.Pool) *BookingRepo { return &BookingRepo{db: db} }

const bookingCols = `id, client_id, admin_id, slot_start, slot_end, status, client_notes, admin_notes, created_at, updated_at`

func scanBooking(row pgx.Row, b *models.Booking) error {
	return row.Scan(&b.ID, &b.ClientID, &b.AdminID, &b.SlotStart, &b.SlotEnd, &b.Status, &b.ClientNotes, &b.AdminNotes, &b.CreatedAt, &b.UpdatedAt)
}

func scanBookings(rows pgx.Rows) ([]models.Booking, error) {
	var out []models.Booking
	for rows.Next() {
		var b models.Booking
		if err := scanBooking(rows, &b); err != nil {
			return nil, err
		}
		out = append(out, b)
	}
	return out, rows.Err()
}

func (r *BookingRepo) Create(ctx context.Context, b *models.Booking) error {
	return r.db.QueryRow(ctx, `
        INSERT INTO bookings (client_id, admin_id, slot_start, slot_end, status, client_notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at, updated_at`,
		b.ClientID, b.AdminID, b.SlotStart, b.SlotEnd, b.Status, b.ClientNotes,
	).Scan(&b.ID, &b.CreatedAt, &b.UpdatedAt)
}

func (r *BookingRepo) GetByID(ctx context.Context, id uuid.UUID) (*models.Booking, error) {
	b := &models.Booking{}
	err := scanBooking(r.db.QueryRow(ctx, `SELECT `+bookingCols+` FROM bookings WHERE id=$1`, id), b)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return b, err
}

func (r *BookingRepo) ListActiveInRange(ctx context.Context, adminID uuid.UUID, from, to time.Time) ([]models.Booking, error) {
	rows, err := r.db.Query(ctx, `
        SELECT `+bookingCols+` FROM bookings
        WHERE admin_id=$1 AND status IN ('pending','confirmed')
          AND slot_start < $3 AND slot_end > $2
        ORDER BY slot_start`, adminID, from, to)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanBookings(rows)
}

func (r *BookingRepo) ListByClient(ctx context.Context, clientID uuid.UUID) ([]models.Booking, error) {
	rows, err := r.db.Query(ctx, `
        SELECT `+bookingCols+` FROM bookings WHERE client_id=$1 ORDER BY slot_start DESC`, clientID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanBookings(rows)
}

// Deprecated: use ListByAdminWithClient for admin-facing reads so the UI
// can show the client identity. Kept for future internal consumers (e.g. the
// planned Telegram bot) that don't need the JOIN.
func (r *BookingRepo) ListByAdmin(ctx context.Context, adminID uuid.UUID, status *models.BookingStatus) ([]models.Booking, error) {
	q := `SELECT ` + bookingCols + ` FROM bookings WHERE admin_id=$1`
	args := []any{adminID}
	if status != nil {
		q += ` AND status=$2`
		args = append(args, *status)
	}
	q += ` ORDER BY slot_start`
	rows, err := r.db.Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanBookings(rows)
}

func (r *BookingRepo) ListByAdminWithClient(ctx context.Context, adminID uuid.UUID, status *models.BookingStatus) ([]models.BookingWithClient, error) {
	q := `
        SELECT b.id, b.client_id, b.admin_id, b.slot_start, b.slot_end, b.status,
               b.client_notes, b.admin_notes, b.created_at, b.updated_at,
               u.id, u.full_name, u.email, u.phone
        FROM bookings b
        JOIN users    u ON u.id = b.client_id
        WHERE b.admin_id = $1`
	args := []any{adminID}
	if status != nil {
		q += ` AND b.status = $2`
		args = append(args, *status)
	}
	q += ` ORDER BY b.slot_start`
	rows, err := r.db.Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.BookingWithClient
	for rows.Next() {
		var b models.BookingWithClient
		if err := rows.Scan(
			&b.ID, &b.ClientID, &b.AdminID, &b.SlotStart, &b.SlotEnd, &b.Status,
			&b.ClientNotes, &b.AdminNotes, &b.CreatedAt, &b.UpdatedAt,
			&b.Client.ID, &b.Client.FullName, &b.Client.Email, &b.Client.Phone,
		); err != nil {
			return nil, err
		}
		out = append(out, b)
	}
	return out, rows.Err()
}

func (r *BookingRepo) UpdateStatus(ctx context.Context, id uuid.UUID, status models.BookingStatus, adminNotes *string) error {
	_, err := r.db.Exec(ctx, `
        UPDATE bookings SET status=$2, admin_notes=COALESCE($3, admin_notes), updated_at=now()
        WHERE id=$1`, id, status, adminNotes)
	return err
}

func (r *BookingRepo) Reschedule(ctx context.Context, id uuid.UUID, newStart, newEnd time.Time) error {
	_, err := r.db.Exec(ctx, `
        UPDATE bookings SET slot_start=$2, slot_end=$3, updated_at=now()
        WHERE id=$1`, id, newStart, newEnd)
	return err
}
