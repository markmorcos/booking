package repository

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type CreateAppointmentParams struct {
	TenantID uuid.UUID
	UserID   uuid.UUID
	SlotID   uuid.UUID
	Status   string
	Notes    sql.NullString
}

func (q *Queries) CreateAppointment(ctx context.Context, arg CreateAppointmentParams) (AppointmentRow, error) {
	row := q.db.QueryRowContext(ctx,
		`INSERT INTO appointments (tenant_id, user_id, slot_id, status, notes)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, tenant_id, user_id, slot_id, status, notes, cancellation_reason, created_at, updated_at`,
		arg.TenantID, arg.UserID, arg.SlotID, arg.Status, arg.Notes)
	var a AppointmentRow
	err := row.Scan(&a.ID, &a.TenantID, &a.UserID, &a.SlotID, &a.Status, &a.Notes, &a.CancellationReason, &a.CreatedAt, &a.UpdatedAt)
	return a, err
}

func (q *Queries) GetAppointmentByID(ctx context.Context, id uuid.UUID) (AppointmentRow, error) {
	row := q.db.QueryRowContext(ctx,
		`SELECT a.id, a.tenant_id, a.user_id, a.slot_id, a.status, a.notes, a.cancellation_reason,
		        a.created_at, a.updated_at, s.starts_at, s.ends_at
		 FROM appointments a
		 JOIN availability_slots s ON a.slot_id = s.id
		 WHERE a.id = $1`, id)
	var a AppointmentRow
	err := row.Scan(&a.ID, &a.TenantID, &a.UserID, &a.SlotID, &a.Status, &a.Notes, &a.CancellationReason,
		&a.CreatedAt, &a.UpdatedAt, &a.SlotStartsAt, &a.SlotEndsAt)
	return a, err
}

func (q *Queries) ListAppointmentsByUser(ctx context.Context, userID uuid.UUID) ([]AppointmentRow, error) {
	rows, err := q.db.QueryContext(ctx,
		`SELECT a.id, a.tenant_id, a.user_id, a.slot_id, a.status, a.notes, a.cancellation_reason,
		        a.created_at, a.updated_at, s.starts_at, s.ends_at
		 FROM appointments a
		 JOIN availability_slots s ON a.slot_id = s.id
		 WHERE a.user_id = $1
		 ORDER BY s.starts_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanAppointmentRows(rows)
}

func (q *Queries) ListAppointmentsByTenant(ctx context.Context, tenantID uuid.UUID) ([]AppointmentRow, error) {
	rows, err := q.db.QueryContext(ctx,
		`SELECT a.id, a.tenant_id, a.user_id, a.slot_id, a.status, a.notes, a.cancellation_reason,
		        a.created_at, a.updated_at, s.starts_at, s.ends_at
		 FROM appointments a
		 JOIN availability_slots s ON a.slot_id = s.id
		 WHERE a.tenant_id = $1
		 ORDER BY s.starts_at DESC`, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanAppointmentRows(rows)
}

type ListAppointmentsFilteredParams struct {
	TenantID uuid.UUID
	Status   string
	From     time.Time
	To       time.Time
	UserID   uuid.UUID
}

func (q *Queries) ListAppointmentsByTenantFiltered(ctx context.Context, arg ListAppointmentsFilteredParams) ([]AppointmentRow, error) {
	rows, err := q.db.QueryContext(ctx,
		`SELECT a.id, a.tenant_id, a.user_id, a.slot_id, a.status, a.notes, a.cancellation_reason,
		        a.created_at, a.updated_at, s.starts_at, s.ends_at
		 FROM appointments a
		 JOIN availability_slots s ON a.slot_id = s.id
		 WHERE a.tenant_id = $1
		   AND ($2::VARCHAR = '' OR a.status = $2::VARCHAR)
		   AND ($3::TIMESTAMPTZ = '0001-01-01' OR s.starts_at >= $3::TIMESTAMPTZ)
		   AND ($4::TIMESTAMPTZ = '0001-01-01' OR s.starts_at < $4::TIMESTAMPTZ)
		   AND ($5::UUID = '00000000-0000-0000-0000-000000000000' OR a.user_id = $5::UUID)
		 ORDER BY s.starts_at DESC`,
		arg.TenantID, arg.Status, arg.From, arg.To, arg.UserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanAppointmentRows(rows)
}

func (q *Queries) UpdateAppointmentStatus(ctx context.Context, id uuid.UUID, status string) (AppointmentRow, error) {
	row := q.db.QueryRowContext(ctx,
		`UPDATE appointments SET status = $2, updated_at = NOW() WHERE id = $1
		 RETURNING id, tenant_id, user_id, slot_id, status, notes, cancellation_reason, created_at, updated_at`,
		id, status)
	var a AppointmentRow
	err := row.Scan(&a.ID, &a.TenantID, &a.UserID, &a.SlotID, &a.Status, &a.Notes, &a.CancellationReason,
		&a.CreatedAt, &a.UpdatedAt)
	return a, err
}

func (q *Queries) UpdateAppointmentCancellation(ctx context.Context, id uuid.UUID, reason sql.NullString) (AppointmentRow, error) {
	row := q.db.QueryRowContext(ctx,
		`UPDATE appointments SET status = 'cancelled', cancellation_reason = $2, updated_at = NOW() WHERE id = $1
		 RETURNING id, tenant_id, user_id, slot_id, status, notes, cancellation_reason, created_at, updated_at`,
		id, reason)
	var a AppointmentRow
	err := row.Scan(&a.ID, &a.TenantID, &a.UserID, &a.SlotID, &a.Status, &a.Notes, &a.CancellationReason,
		&a.CreatedAt, &a.UpdatedAt)
	return a, err
}

func (q *Queries) GetAppointmentBySlotID(ctx context.Context, slotID uuid.UUID) (AppointmentRow, error) {
	row := q.db.QueryRowContext(ctx,
		`SELECT a.id, a.tenant_id, a.user_id, a.slot_id, a.status, a.notes, a.cancellation_reason,
		        a.created_at, a.updated_at, s.starts_at, s.ends_at
		 FROM appointments a
		 JOIN availability_slots s ON a.slot_id = s.id
		 WHERE a.slot_id = $1 AND a.status NOT IN ('cancelled', 'rescheduled')`, slotID)
	var a AppointmentRow
	err := row.Scan(&a.ID, &a.TenantID, &a.UserID, &a.SlotID, &a.Status, &a.Notes, &a.CancellationReason,
		&a.CreatedAt, &a.UpdatedAt, &a.SlotStartsAt, &a.SlotEndsAt)
	return a, err
}

func (q *Queries) ListTomorrowAppointments(ctx context.Context, from time.Time, to time.Time) ([]AppointmentRow, error) {
	rows, err := q.db.QueryContext(ctx,
		`SELECT a.id, a.tenant_id, a.user_id, a.slot_id, a.status, a.notes, a.cancellation_reason,
		        a.created_at, a.updated_at, s.starts_at, s.ends_at
		 FROM appointments a
		 JOIN availability_slots s ON a.slot_id = s.id
		 WHERE a.status IN ('pending', 'confirmed')
		   AND s.starts_at >= $1 AND s.starts_at < $2`, from, to)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanAppointmentRows(rows)
}

func scanAppointmentRows(rows *sql.Rows) ([]AppointmentRow, error) {
	var appointments []AppointmentRow
	for rows.Next() {
		var a AppointmentRow
		if err := rows.Scan(&a.ID, &a.TenantID, &a.UserID, &a.SlotID, &a.Status, &a.Notes, &a.CancellationReason,
			&a.CreatedAt, &a.UpdatedAt, &a.SlotStartsAt, &a.SlotEndsAt); err != nil {
			return nil, err
		}
		appointments = append(appointments, a)
	}
	return appointments, rows.Err()
}
