package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"therapy-backend/internal/models"
)

type ScheduleRepo struct{ db *pgxpool.Pool }

func NewScheduleRepo(db *pgxpool.Pool) *ScheduleRepo { return &ScheduleRepo{db: db} }

const tplSelect = `
    SELECT id, admin_id, weekday,
           to_char(start_time, 'HH24:MI'),
           to_char(end_time,   'HH24:MI'),
           slot_minutes, is_active
    FROM schedule_templates`

func (r *ScheduleRepo) ListTemplates(ctx context.Context, adminID uuid.UUID) ([]models.ScheduleTemplate, error) {
	rows, err := r.db.Query(ctx, tplSelect+` WHERE admin_id = $1 ORDER BY weekday, start_time`, adminID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.ScheduleTemplate
	for rows.Next() {
		var t models.ScheduleTemplate
		if err := rows.Scan(&t.ID, &t.AdminID, &t.Weekday, &t.StartTime, &t.EndTime, &t.SlotMinutes, &t.IsActive); err != nil {
			return nil, err
		}
		out = append(out, t)
	}
	return out, rows.Err()
}

func (r *ScheduleRepo) ListActiveTemplates(ctx context.Context, adminID uuid.UUID) ([]models.ScheduleTemplate, error) {
	rows, err := r.db.Query(ctx, tplSelect+` WHERE admin_id=$1 AND is_active=TRUE ORDER BY weekday, start_time`, adminID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.ScheduleTemplate
	for rows.Next() {
		var t models.ScheduleTemplate
		if err := rows.Scan(&t.ID, &t.AdminID, &t.Weekday, &t.StartTime, &t.EndTime, &t.SlotMinutes, &t.IsActive); err != nil {
			return nil, err
		}
		out = append(out, t)
	}
	return out, rows.Err()
}

func (r *ScheduleRepo) CreateTemplate(ctx context.Context, t *models.ScheduleTemplate) error {
	return r.db.QueryRow(ctx, `
        INSERT INTO schedule_templates (admin_id, weekday, start_time, end_time, slot_minutes, is_active)
        VALUES ($1, $2, $3::time, $4::time, $5, $6)
        RETURNING id`,
		t.AdminID, t.Weekday, t.StartTime, t.EndTime, t.SlotMinutes, t.IsActive,
	).Scan(&t.ID)
}

func (r *ScheduleRepo) DeleteTemplate(ctx context.Context, adminID, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM schedule_templates WHERE id=$1 AND admin_id=$2`, id, adminID)
	return err
}

func (r *ScheduleRepo) ListBlocks(ctx context.Context, adminID uuid.UUID, from, to time.Time) ([]models.ScheduleBlock, error) {
	rows, err := r.db.Query(ctx, `
        SELECT id, admin_id, starts_at, ends_at, reason, created_at
        FROM schedule_blocks
        WHERE admin_id=$1 AND starts_at < $3 AND ends_at > $2
        ORDER BY starts_at`, adminID, from, to)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.ScheduleBlock
	for rows.Next() {
		var b models.ScheduleBlock
		if err := rows.Scan(&b.ID, &b.AdminID, &b.StartsAt, &b.EndsAt, &b.Reason, &b.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, b)
	}
	return out, rows.Err()
}

func (r *ScheduleRepo) CreateBlock(ctx context.Context, b *models.ScheduleBlock) error {
	return r.db.QueryRow(ctx, `
        INSERT INTO schedule_blocks (admin_id, starts_at, ends_at, reason)
        VALUES ($1, $2, $3, $4)
        RETURNING id, created_at`,
		b.AdminID, b.StartsAt, b.EndsAt, b.Reason,
	).Scan(&b.ID, &b.CreatedAt)
}

func (r *ScheduleRepo) DeleteBlock(ctx context.Context, adminID, id uuid.UUID) error {
	_, err := r.db.Exec(ctx, `DELETE FROM schedule_blocks WHERE id=$1 AND admin_id=$2`, id, adminID)
	return err
}
