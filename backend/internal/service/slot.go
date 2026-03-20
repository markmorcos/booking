package service

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/markmorcos/booking/backend/internal/repository"
)

type SlotService struct {
	db      *sql.DB
	queries *repository.Queries
}

func NewSlotService(db *sql.DB, queries *repository.Queries) *SlotService {
	return &SlotService{db: db, queries: queries}
}

func (s *SlotService) ListAvailable(ctx context.Context, tenantID uuid.UUID, from, to time.Time) ([]repository.AvailabilitySlot, error) {
	return s.queries.ListAvailableSlots(ctx, tenantID, from, to)
}

func (s *SlotService) GetByID(ctx context.Context, id uuid.UUID) (repository.AvailabilitySlot, error) {
	return s.queries.GetAvailabilitySlotByID(ctx, id)
}

func (s *SlotService) Create(ctx context.Context, tenantID uuid.UUID, startsAt, endsAt time.Time) (repository.AvailabilitySlot, error) {
	if !endsAt.After(startsAt) {
		return repository.AvailabilitySlot{}, fmt.Errorf("ends_at must be after starts_at")
	}
	return s.queries.CreateAvailabilitySlot(ctx, repository.CreateAvailabilitySlotParams{
		TenantID:    tenantID,
		StartsAt:    startsAt,
		EndsAt:      endsAt,
		IsAvailable: true,
	})
}

func (s *SlotService) CreateBatch(ctx context.Context, tenantID uuid.UUID, slots []struct {
	StartsAt time.Time
	EndsAt   time.Time
}) ([]repository.AvailabilitySlot, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	qtx := s.queries.WithTx(tx)
	var created []repository.AvailabilitySlot
	for _, slot := range slots {
		if !slot.EndsAt.After(slot.StartsAt) {
			return nil, fmt.Errorf("ends_at must be after starts_at for slot starting at %s", slot.StartsAt)
		}
		s, err := qtx.CreateAvailabilitySlot(ctx, repository.CreateAvailabilitySlotParams{
			TenantID:    tenantID,
			StartsAt:    slot.StartsAt,
			EndsAt:      slot.EndsAt,
			IsAvailable: true,
		})
		if err != nil {
			return nil, fmt.Errorf("failed to create slot: %w", err)
		}
		created = append(created, s)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit: %w", err)
	}
	return created, nil
}

func (s *SlotService) Delete(ctx context.Context, id uuid.UUID, tenantID uuid.UUID) error {
	return s.queries.DeleteAvailabilitySlot(ctx, id, tenantID)
}

func (s *SlotService) DeleteByRange(ctx context.Context, tenantID uuid.UUID, from, to time.Time) error {
	return s.queries.DeleteAvailabilitySlotsByRange(ctx, tenantID, from, to)
}

func (s *SlotService) MaterializeFromRules(ctx context.Context, tenantID uuid.UUID, rules []repository.RecurrenceRule, days int) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	qtx := s.queries.WithTx(tx)
	now := time.Now().UTC()

	for _, rule := range rules {
		exceptions, err := s.queries.ListRecurrenceExceptionsByRule(ctx, rule.ID)
		if err != nil {
			return fmt.Errorf("failed to list exceptions: %w", err)
		}
		exceptionDates := make(map[string]bool)
		for _, exc := range exceptions {
			exceptionDates[exc.ExceptionDate.Format("2006-01-02")] = true
		}

		startTime, err := time.Parse("15:04:05", rule.StartTime)
		if err != nil {
			return fmt.Errorf("failed to parse start time: %w", err)
		}
		endTime, err := time.Parse("15:04:05", rule.EndTime)
		if err != nil {
			return fmt.Errorf("failed to parse end time: %w", err)
		}

		for d := 0; d < days; d++ {
			date := now.AddDate(0, 0, d)
			if int(date.Weekday()) != int(rule.DayOfWeek) {
				continue
			}
			if date.Before(rule.EffectiveFrom) {
				continue
			}
			if rule.EffectiveUntil.Valid && date.After(rule.EffectiveUntil.Time) {
				continue
			}
			dateStr := date.Format("2006-01-02")
			if exceptionDates[dateStr] {
				continue
			}

			// Generate slots for this day
			slotStart := time.Date(date.Year(), date.Month(), date.Day(),
				startTime.Hour(), startTime.Minute(), 0, 0, time.UTC)
			slotEnd := time.Date(date.Year(), date.Month(), date.Day(),
				endTime.Hour(), endTime.Minute(), 0, 0, time.UTC)
			duration := time.Duration(rule.SlotDurationMinutes) * time.Minute

			for t := slotStart; t.Add(duration).Before(slotEnd) || t.Add(duration).Equal(slotEnd); t = t.Add(duration) {
				endSlot := t.Add(duration)
				// Check if slot already exists
				_, err := qtx.GetSlotByTenantAndTime(ctx, tenantID, t, endSlot)
				if err == nil {
					continue // slot already exists
				}

				_, err = qtx.CreateAvailabilitySlot(ctx, repository.CreateAvailabilitySlotParams{
					TenantID:         tenantID,
					RecurrenceRuleID: uuid.NullUUID{UUID: rule.ID, Valid: true},
					StartsAt:         t,
					EndsAt:           endSlot,
					IsAvailable:      true,
				})
				if err != nil {
					return fmt.Errorf("failed to create slot: %w", err)
				}
			}
		}
	}

	return tx.Commit()
}
