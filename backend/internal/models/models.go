package models

import (
	"time"

	"github.com/google/uuid"
)

type Role string

const (
	RoleClient Role = "client"
	RoleAdmin  Role = "admin"
)

type User struct {
	ID           uuid.UUID `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	FullName     string    `json:"full_name"`
	Phone        *string   `json:"phone,omitempty"`
	Role         Role      `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type ScheduleTemplate struct {
	ID          uuid.UUID `json:"id"`
	AdminID     uuid.UUID `json:"admin_id"`
	Weekday     int       `json:"weekday"`
	StartTime   string    `json:"start_time"`
	EndTime     string    `json:"end_time"`
	SlotMinutes int       `json:"slot_minutes"`
	IsActive    bool      `json:"is_active"`
}

type ScheduleBlock struct {
	ID        uuid.UUID `json:"id"`
	AdminID   uuid.UUID `json:"admin_id"`
	StartsAt  time.Time `json:"starts_at"`
	EndsAt    time.Time `json:"ends_at"`
	Reason    *string   `json:"reason,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type BookingStatus string

const (
	BookingPending   BookingStatus = "pending"
	BookingConfirmed BookingStatus = "confirmed"
	BookingCancelled BookingStatus = "cancelled"
	BookingCompleted BookingStatus = "completed"
)

type Booking struct {
	ID          uuid.UUID     `json:"id"`
	ClientID    uuid.UUID     `json:"client_id"`
	AdminID     uuid.UUID     `json:"admin_id"`
	SlotStart   time.Time     `json:"slot_start"`
	SlotEnd     time.Time     `json:"slot_end"`
	Status      BookingStatus `json:"status"`
	ClientNotes *string       `json:"client_notes,omitempty"`
	AdminNotes  *string       `json:"admin_notes,omitempty"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
}

type Slot struct {
	Start time.Time `json:"start"`
	End   time.Time `json:"end"`
}
