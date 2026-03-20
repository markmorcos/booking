package service

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/markmorcos/booking/backend/internal/repository"
)

type AppointmentService struct {
	db      *sql.DB
	queries *repository.Queries
}

func NewAppointmentService(db *sql.DB, queries *repository.Queries) *AppointmentService {
	return &AppointmentService{db: db, queries: queries}
}

func (s *AppointmentService) Book(ctx context.Context, tenantID, userID, slotID uuid.UUID, notes string) (repository.AppointmentRow, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	qtx := s.queries.WithTx(tx)

	// Check slot exists and is available
	slot, err := qtx.GetAvailabilitySlotByID(ctx, slotID)
	if err != nil {
		if err == sql.ErrNoRows {
			return repository.AppointmentRow{}, fmt.Errorf("slot not found")
		}
		return repository.AppointmentRow{}, fmt.Errorf("failed to get slot: %w", err)
	}

	if slot.TenantID != tenantID {
		return repository.AppointmentRow{}, fmt.Errorf("slot does not belong to your tenant")
	}

	if !slot.IsAvailable {
		return repository.AppointmentRow{}, fmt.Errorf("slot is not available")
	}

	if slot.StartsAt.Before(time.Now()) {
		return repository.AppointmentRow{}, fmt.Errorf("cannot book a slot in the past")
	}

	// Mark slot as unavailable
	if err := qtx.MarkSlotUnavailable(ctx, slotID); err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("failed to mark slot unavailable: %w", err)
	}

	notesNull := sql.NullString{}
	if notes != "" {
		notesNull = sql.NullString{String: notes, Valid: true}
	}

	// Create appointment
	appt, err := qtx.CreateAppointment(ctx, repository.CreateAppointmentParams{
		TenantID: tenantID,
		UserID:   userID,
		SlotID:   slotID,
		Status:   "pending",
		Notes:    notesNull,
	})
	if err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("failed to create appointment: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("failed to commit: %w", err)
	}

	// Re-fetch with slot details
	return s.queries.GetAppointmentByID(ctx, appt.ID)
}

func (s *AppointmentService) GetByID(ctx context.Context, id uuid.UUID) (repository.AppointmentRow, error) {
	return s.queries.GetAppointmentByID(ctx, id)
}

func (s *AppointmentService) ListByUser(ctx context.Context, userID uuid.UUID) ([]repository.AppointmentRow, error) {
	return s.queries.ListAppointmentsByUser(ctx, userID)
}

func (s *AppointmentService) ListByTenant(ctx context.Context, tenantID uuid.UUID) ([]repository.AppointmentRow, error) {
	return s.queries.ListAppointmentsByTenant(ctx, tenantID)
}

func (s *AppointmentService) ListByTenantFiltered(ctx context.Context, arg repository.ListAppointmentsFilteredParams) ([]repository.AppointmentRow, error) {
	return s.queries.ListAppointmentsByTenantFiltered(ctx, arg)
}

func (s *AppointmentService) Cancel(ctx context.Context, id uuid.UUID, reason string) (repository.AppointmentRow, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	qtx := s.queries.WithTx(tx)

	appt, err := s.queries.GetAppointmentByID(ctx, id)
	if err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("appointment not found: %w", err)
	}

	if appt.Status == "cancelled" || appt.Status == "completed" {
		return repository.AppointmentRow{}, fmt.Errorf("cannot cancel appointment with status %s", appt.Status)
	}

	reasonNull := sql.NullString{}
	if reason != "" {
		reasonNull = sql.NullString{String: reason, Valid: true}
	}

	result, err := qtx.UpdateAppointmentCancellation(ctx, id, reasonNull)
	if err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("failed to cancel appointment: %w", err)
	}

	// Make slot available again
	if err := qtx.MarkSlotAvailable(ctx, appt.SlotID); err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("failed to mark slot available: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("failed to commit: %w", err)
	}

	result.SlotStartsAt = appt.SlotStartsAt
	result.SlotEndsAt = appt.SlotEndsAt
	return result, nil
}

func (s *AppointmentService) Reschedule(ctx context.Context, appointmentID, newSlotID uuid.UUID) (repository.AppointmentRow, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	qtx := s.queries.WithTx(tx)

	// Get existing appointment
	appt, err := s.queries.GetAppointmentByID(ctx, appointmentID)
	if err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("appointment not found: %w", err)
	}

	if appt.Status == "cancelled" || appt.Status == "completed" || appt.Status == "rescheduled" {
		return repository.AppointmentRow{}, fmt.Errorf("cannot reschedule appointment with status %s", appt.Status)
	}

	// Check new slot
	newSlot, err := qtx.GetAvailabilitySlotByID(ctx, newSlotID)
	if err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("new slot not found: %w", err)
	}

	if newSlot.TenantID != appt.TenantID {
		return repository.AppointmentRow{}, fmt.Errorf("new slot does not belong to the same tenant")
	}

	if !newSlot.IsAvailable {
		return repository.AppointmentRow{}, fmt.Errorf("new slot is not available")
	}

	// Mark old appointment as rescheduled
	_, err = qtx.UpdateAppointmentStatus(ctx, appointmentID, "rescheduled")
	if err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("failed to update old appointment: %w", err)
	}

	// Release old slot
	if err := qtx.MarkSlotAvailable(ctx, appt.SlotID); err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("failed to release old slot: %w", err)
	}

	// Mark new slot as unavailable
	if err := qtx.MarkSlotUnavailable(ctx, newSlotID); err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("failed to mark new slot unavailable: %w", err)
	}

	// Create new appointment
	newAppt, err := qtx.CreateAppointment(ctx, repository.CreateAppointmentParams{
		TenantID: appt.TenantID,
		UserID:   appt.UserID,
		SlotID:   newSlotID,
		Status:   "pending",
		Notes:    appt.Notes,
	})
	if err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("failed to create new appointment: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("failed to commit: %w", err)
	}

	return s.queries.GetAppointmentByID(ctx, newAppt.ID)
}

func (s *AppointmentService) Confirm(ctx context.Context, id uuid.UUID) (repository.AppointmentRow, error) {
	appt, err := s.queries.GetAppointmentByID(ctx, id)
	if err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("appointment not found: %w", err)
	}
	if appt.Status != "pending" {
		return repository.AppointmentRow{}, fmt.Errorf("can only confirm pending appointments, current status: %s", appt.Status)
	}
	result, err := s.queries.UpdateAppointmentStatus(ctx, id, "confirmed")
	if err != nil {
		return repository.AppointmentRow{}, err
	}
	result.SlotStartsAt = appt.SlotStartsAt
	result.SlotEndsAt = appt.SlotEndsAt
	return result, nil
}

func (s *AppointmentService) Complete(ctx context.Context, id uuid.UUID) (repository.AppointmentRow, error) {
	appt, err := s.queries.GetAppointmentByID(ctx, id)
	if err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("appointment not found: %w", err)
	}
	if appt.Status != "confirmed" && appt.Status != "pending" {
		return repository.AppointmentRow{}, fmt.Errorf("can only complete confirmed/pending appointments, current status: %s", appt.Status)
	}
	result, err := s.queries.UpdateAppointmentStatus(ctx, id, "completed")
	if err != nil {
		return repository.AppointmentRow{}, err
	}
	result.SlotStartsAt = appt.SlotStartsAt
	result.SlotEndsAt = appt.SlotEndsAt
	return result, nil
}

func (s *AppointmentService) NoShow(ctx context.Context, id uuid.UUID) (repository.AppointmentRow, error) {
	appt, err := s.queries.GetAppointmentByID(ctx, id)
	if err != nil {
		return repository.AppointmentRow{}, fmt.Errorf("appointment not found: %w", err)
	}
	if appt.Status == "cancelled" || appt.Status == "completed" {
		return repository.AppointmentRow{}, fmt.Errorf("cannot mark as no-show with status: %s", appt.Status)
	}
	result, err := s.queries.UpdateAppointmentStatus(ctx, id, "no_show")
	if err != nil {
		return repository.AppointmentRow{}, err
	}
	result.SlotStartsAt = appt.SlotStartsAt
	result.SlotEndsAt = appt.SlotEndsAt
	return result, nil
}

func (s *AppointmentService) ListTomorrow(ctx context.Context, from, to time.Time) ([]repository.AppointmentRow, error) {
	return s.queries.ListTomorrowAppointments(ctx, from, to)
}
