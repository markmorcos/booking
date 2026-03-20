-- name: CreateNotificationLog :one
INSERT INTO notification_logs (tenant_id, appointment_id, user_id, channel, event_type, status, error_message)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, tenant_id, appointment_id, user_id, channel, event_type, status, error_message, created_at, updated_at;

-- name: ListNotificationLogsByAppointment :many
SELECT id, tenant_id, appointment_id, user_id, channel, event_type, status, error_message, created_at, updated_at
FROM notification_logs
WHERE appointment_id = $1
ORDER BY created_at DESC;

-- name: UpdateNotificationLogStatus :exec
UPDATE notification_logs
SET status = $2, error_message = $3, updated_at = NOW()
WHERE id = $1;
