package service

import (
	"context"
	"time"

	"github.com/google/uuid"

	"therapy-backend/internal/models"
	"therapy-backend/internal/repository"
)

type ScheduleService struct {
	sched    *repository.ScheduleRepo
	bookings *repository.BookingRepo
	tz       *time.Location
}

func NewScheduleService(s *repository.ScheduleRepo, b *repository.BookingRepo, tz *time.Location) *ScheduleService {
	return &ScheduleService{sched: s, bookings: b, tz: tz}
}

// AvailableSlots returns all bookable slots for the given admin in [from, to),
// computed from active weekly templates minus existing bookings and schedule blocks.
// Slot start/end are returned in UTC; all generation happens in the clinic timezone.
func (s *ScheduleService) AvailableSlots(ctx context.Context, adminID uuid.UUID, from, to time.Time) ([]models.Slot, error) {
	now := time.Now()
	if from.Before(now) {
		from = now
	}
	if !to.After(from) {
		return []models.Slot{}, nil
	}

	tpls, err := s.sched.ListActiveTemplates(ctx, adminID)
	if err != nil {
		return nil, err
	}
	blocks, err := s.sched.ListBlocks(ctx, adminID, from, to)
	if err != nil {
		return nil, err
	}
	booked, err := s.bookings.ListActiveInRange(ctx, adminID, from, to)
	if err != nil {
		return nil, err
	}

	bookedSet := make(map[int64]bool, len(booked))
	for _, b := range booked {
		bookedSet[b.SlotStart.Unix()] = true
	}

	fromL := from.In(s.tz)
	toL := to.In(s.tz)
	dayStart := time.Date(fromL.Year(), fromL.Month(), fromL.Day(), 0, 0, 0, 0, s.tz)

	out := make([]models.Slot, 0)
	for d := dayStart; d.Before(toL); d = d.AddDate(0, 0, 1) {
		wd := int(d.Weekday())
		for _, t := range tpls {
			if t.Weekday != wd {
				continue
			}
			sh, sm := parseHM(t.StartTime)
			eh, em := parseHM(t.EndTime)
			winStart := time.Date(d.Year(), d.Month(), d.Day(), sh, sm, 0, 0, s.tz)
			winEnd := time.Date(d.Year(), d.Month(), d.Day(), eh, em, 0, 0, s.tz)
			step := time.Duration(t.SlotMinutes) * time.Minute
			for cur := winStart; !cur.Add(step).After(winEnd); cur = cur.Add(step) {
				slotEnd := cur.Add(step)
				if !cur.After(now) {
					continue
				}
				if cur.Before(from) || slotEnd.After(to) {
					continue
				}
				if bookedSet[cur.Unix()] {
					continue
				}
				if overlapsBlock(cur, slotEnd, blocks) {
					continue
				}
				out = append(out, models.Slot{Start: cur.UTC(), End: slotEnd.UTC()})
			}
		}
	}
	return out, nil
}

// IsSlotAvailable verifies that `start` begins a valid, free template slot.
// Returns slot end time on success.
func (s *ScheduleService) IsSlotAvailable(ctx context.Context, adminID uuid.UUID, start time.Time) (bool, time.Time, error) {
	slots, err := s.AvailableSlots(ctx, adminID, start.Add(-time.Second), start.Add(48*time.Hour))
	if err != nil {
		return false, time.Time{}, err
	}
	for _, sl := range slots {
		if sl.Start.Equal(start) {
			return true, sl.End, nil
		}
	}
	return false, time.Time{}, nil
}

func overlapsBlock(s, e time.Time, blocks []models.ScheduleBlock) bool {
	for _, b := range blocks {
		if s.Before(b.EndsAt) && e.After(b.StartsAt) {
			return true
		}
	}
	return false
}

// parseHM parses "HH:MM" (24h) into hour and minute.
func parseHM(s string) (int, int) {
	if len(s) < 5 {
		return 0, 0
	}
	h := int(s[0]-'0')*10 + int(s[1]-'0')
	m := int(s[3]-'0')*10 + int(s[4]-'0')
	return h, m
}
