package service

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"

	"therapy-backend/internal/models"
	"therapy-backend/internal/repository"
)

var (
	ErrSlotNotAvailable = errors.New("slot not available")
	ErrForbidden        = errors.New("forbidden")
	ErrBadState         = errors.New("invalid booking state")
)

type BookingService struct {
	bookings *repository.BookingRepo
	users    *repository.UserRepo
	sched    *ScheduleService
	mail     *MailService
}

func NewBookingService(b *repository.BookingRepo, u *repository.UserRepo, s *ScheduleService, m *MailService) *BookingService {
	return &BookingService{bookings: b, users: u, sched: s, mail: m}
}

func (s *BookingService) Create(ctx context.Context, clientID uuid.UUID, slotStart time.Time, notes *string) (*models.Booking, error) {
	admin, err := s.users.GetAdmin(ctx)
	if err != nil {
		return nil, err
	}
	ok, slotEnd, err := s.sched.IsSlotAvailable(ctx, admin.ID, slotStart)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, ErrSlotNotAvailable
	}

	client, err := s.users.FindByID(ctx, clientID)
	if err != nil {
		return nil, err
	}

	b := &models.Booking{
		ClientID:    clientID,
		AdminID:     admin.ID,
		SlotStart:   slotStart,
		SlotEnd:     slotEnd,
		Status:      models.BookingPending,
		ClientNotes: notes,
	}
	if err := s.bookings.Create(ctx, b); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, ErrSlotNotAvailable
		}
		return nil, err
	}
	go s.mail.NotifyAdminNewBooking(admin.Email, client, b)
	return b, nil
}

func (s *BookingService) Confirm(ctx context.Context, id uuid.UUID, adminNotes *string) (*models.Booking, error) {
	b, err := s.bookings.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if b.Status != models.BookingPending {
		return nil, ErrBadState
	}
	if err := s.bookings.UpdateStatus(ctx, id, models.BookingConfirmed, adminNotes); err != nil {
		return nil, err
	}
	b.Status = models.BookingConfirmed
	if adminNotes != nil {
		b.AdminNotes = adminNotes
	}
	if client, err := s.users.FindByID(ctx, b.ClientID); err == nil {
		go s.mail.NotifyClientBookingConfirmed(client, b)
	}
	return b, nil
}

func (s *BookingService) Cancel(ctx context.Context, id, byUserID uuid.UUID, role models.Role) (*models.Booking, error) {
	b, err := s.bookings.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if role != models.RoleAdmin && b.ClientID != byUserID {
		return nil, ErrForbidden
	}
	if b.Status == models.BookingCancelled || b.Status == models.BookingCompleted {
		return nil, ErrBadState
	}
	if err := s.bookings.UpdateStatus(ctx, id, models.BookingCancelled, nil); err != nil {
		return nil, err
	}
	b.Status = models.BookingCancelled
	return b, nil
}

func (s *BookingService) Reschedule(ctx context.Context, id, byUserID uuid.UUID, role models.Role, newStart time.Time) (*models.Booking, error) {
	b, err := s.bookings.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if role != models.RoleAdmin && b.ClientID != byUserID {
		return nil, ErrForbidden
	}
	if !b.SlotStart.After(time.Now()) {
		return nil, ErrBadState
	}
	if b.Status != models.BookingPending && b.Status != models.BookingConfirmed {
		return nil, ErrBadState
	}
	ok, newEnd, err := s.sched.IsSlotAvailable(ctx, b.AdminID, newStart)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, ErrSlotNotAvailable
	}
	if err := s.bookings.Reschedule(ctx, id, newStart, newEnd); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, ErrSlotNotAvailable
		}
		return nil, err
	}
	b.SlotStart = newStart
	b.SlotEnd = newEnd
	return b, nil
}
