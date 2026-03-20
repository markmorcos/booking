package repository

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
)

type CreateNotificationLogParams struct {
	TenantID      uuid.UUID
	AppointmentID uuid.NullUUID
	UserID        uuid.UUID
	Channel       string
	EventType     string
	Status        string
	ErrorMessage  sql.NullString
}

func (q *Queries) CreateNotificationLog(ctx context.Context, arg CreateNotificationLogParams) (NotificationLog, error) {
	row := q.db.QueryRowContext(ctx,
		`INSERT INTO notification_logs (tenant_id, appointment_id, user_id, channel, event_type, status, error_message)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING id, tenant_id, appointment_id, user_id, channel, event_type, status, error_message, created_at, updated_at`,
		arg.TenantID, arg.AppointmentID, arg.UserID, arg.Channel, arg.EventType, arg.Status, arg.ErrorMessage)
	var n NotificationLog
	err := row.Scan(&n.ID, &n.TenantID, &n.AppointmentID, &n.UserID, &n.Channel, &n.EventType, &n.Status, &n.ErrorMessage, &n.CreatedAt, &n.UpdatedAt)
	return n, err
}

func (q *Queries) ListNotificationLogsByAppointment(ctx context.Context, appointmentID uuid.UUID) ([]NotificationLog, error) {
	rows, err := q.db.QueryContext(ctx,
		`SELECT id, tenant_id, appointment_id, user_id, channel, event_type, status, error_message, created_at, updated_at
		 FROM notification_logs WHERE appointment_id = $1 ORDER BY created_at DESC`, appointmentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var logs []NotificationLog
	for rows.Next() {
		var n NotificationLog
		if err := rows.Scan(&n.ID, &n.TenantID, &n.AppointmentID, &n.UserID, &n.Channel, &n.EventType, &n.Status, &n.ErrorMessage, &n.CreatedAt, &n.UpdatedAt); err != nil {
			return nil, err
		}
		logs = append(logs, n)
	}
	return logs, rows.Err()
}

func (q *Queries) UpdateNotificationLogStatus(ctx context.Context, id uuid.UUID, status string, errorMessage sql.NullString) error {
	_, err := q.db.ExecContext(ctx,
		`UPDATE notification_logs SET status = $2, error_message = $3, updated_at = NOW() WHERE id = $1`,
		id, status, errorMessage)
	return err
}
