package repository

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type CreateAvailabilitySlotParams struct {
	TenantID         uuid.UUID
	RecurrenceRuleID uuid.NullUUID
	StartsAt         time.Time
	EndsAt           time.Time
	IsAvailable      bool
}

func (q *Queries) CreateAvailabilitySlot(ctx context.Context, arg CreateAvailabilitySlotParams) (AvailabilitySlot, error) {
	row := q.db.QueryRowContext(ctx,
		`INSERT INTO availability_slots (tenant_id, recurrence_rule_id, starts_at, ends_at, is_available)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, tenant_id, recurrence_rule_id, starts_at, ends_at, is_available, created_at, updated_at`,
		arg.TenantID, arg.RecurrenceRuleID, arg.StartsAt, arg.EndsAt, arg.IsAvailable)
	var s AvailabilitySlot
	err := row.Scan(&s.ID, &s.TenantID, &s.RecurrenceRuleID, &s.StartsAt, &s.EndsAt, &s.IsAvailable, &s.CreatedAt, &s.UpdatedAt)
	return s, err
}

func (q *Queries) GetAvailabilitySlotByID(ctx context.Context, id uuid.UUID) (AvailabilitySlot, error) {
	row := q.db.QueryRowContext(ctx,
		`SELECT id, tenant_id, recurrence_rule_id, starts_at, ends_at, is_available, created_at, updated_at
		 FROM availability_slots WHERE id = $1`, id)
	var s AvailabilitySlot
	err := row.Scan(&s.ID, &s.TenantID, &s.RecurrenceRuleID, &s.StartsAt, &s.EndsAt, &s.IsAvailable, &s.CreatedAt, &s.UpdatedAt)
	return s, err
}

func (q *Queries) ListAvailableSlots(ctx context.Context, tenantID uuid.UUID, from time.Time, to time.Time) ([]AvailabilitySlot, error) {
	rows, err := q.db.QueryContext(ctx,
		`SELECT id, tenant_id, recurrence_rule_id, starts_at, ends_at, is_available, created_at, updated_at
		 FROM availability_slots
		 WHERE tenant_id = $1 AND is_available = true AND starts_at >= $2 AND starts_at < $3
		 ORDER BY starts_at`, tenantID, from, to)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var slots []AvailabilitySlot
	for rows.Next() {
		var s AvailabilitySlot
		if err := rows.Scan(&s.ID, &s.TenantID, &s.RecurrenceRuleID, &s.StartsAt, &s.EndsAt, &s.IsAvailable, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		slots = append(slots, s)
	}
	return slots, rows.Err()
}

func (q *Queries) DeleteAvailabilitySlot(ctx context.Context, id uuid.UUID, tenantID uuid.UUID) error {
	_, err := q.db.ExecContext(ctx,
		`DELETE FROM availability_slots WHERE id = $1 AND tenant_id = $2`, id, tenantID)
	return err
}

func (q *Queries) DeleteAvailabilitySlotsByRange(ctx context.Context, tenantID uuid.UUID, from time.Time, to time.Time) error {
	_, err := q.db.ExecContext(ctx,
		`DELETE FROM availability_slots WHERE tenant_id = $1 AND starts_at >= $2 AND starts_at < $3`,
		tenantID, from, to)
	return err
}

func (q *Queries) MarkSlotUnavailable(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.ExecContext(ctx,
		`UPDATE availability_slots SET is_available = false, updated_at = NOW() WHERE id = $1`, id)
	return err
}

func (q *Queries) MarkSlotAvailable(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.ExecContext(ctx,
		`UPDATE availability_slots SET is_available = true, updated_at = NOW() WHERE id = $1`, id)
	return err
}

func (q *Queries) DeleteOldSlots(ctx context.Context, before time.Time) error {
	_, err := q.db.ExecContext(ctx,
		`DELETE FROM availability_slots
		 WHERE starts_at < $1 AND is_available = true
		 AND id NOT IN (SELECT slot_id FROM appointments WHERE status NOT IN ('cancelled', 'completed', 'no_show'))`,
		before)
	return err
}

func (q *Queries) GetSlotByTenantAndTime(ctx context.Context, tenantID uuid.UUID, startsAt time.Time, endsAt time.Time) (AvailabilitySlot, error) {
	row := q.db.QueryRowContext(ctx,
		`SELECT id, tenant_id, recurrence_rule_id, starts_at, ends_at, is_available, created_at, updated_at
		 FROM availability_slots WHERE tenant_id = $1 AND starts_at = $2 AND ends_at = $3 LIMIT 1`,
		tenantID, startsAt, endsAt)
	var s AvailabilitySlot
	err := row.Scan(&s.ID, &s.TenantID, &s.RecurrenceRuleID, &s.StartsAt, &s.EndsAt, &s.IsAvailable, &s.CreatedAt, &s.UpdatedAt)
	if err == sql.ErrNoRows {
		return s, sql.ErrNoRows
	}
	return s, err
}
