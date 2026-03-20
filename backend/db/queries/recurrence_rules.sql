-- name: CreateRecurrenceRule :one
INSERT INTO recurrence_rules (tenant_id, day_of_week, start_time, end_time, slot_duration_minutes, effective_from, effective_until)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, tenant_id, day_of_week, start_time, end_time, slot_duration_minutes, effective_from, effective_until, created_at, updated_at;

-- name: GetRecurrenceRuleByID :one
SELECT id, tenant_id, day_of_week, start_time, end_time, slot_duration_minutes, effective_from, effective_until, created_at, updated_at
FROM recurrence_rules
WHERE id = $1 AND tenant_id = $2;

-- name: ListRecurrenceRulesByTenant :many
SELECT id, tenant_id, day_of_week, start_time, end_time, slot_duration_minutes, effective_from, effective_until, created_at, updated_at
FROM recurrence_rules
WHERE tenant_id = $1
ORDER BY day_of_week, start_time;

-- name: UpdateRecurrenceRule :one
UPDATE recurrence_rules
SET day_of_week = $3, start_time = $4, end_time = $5, slot_duration_minutes = $6,
    effective_from = $7, effective_until = $8, updated_at = NOW()
WHERE id = $1 AND tenant_id = $2
RETURNING id, tenant_id, day_of_week, start_time, end_time, slot_duration_minutes, effective_from, effective_until, created_at, updated_at;

-- name: DeleteRecurrenceRule :exec
DELETE FROM recurrence_rules WHERE id = $1 AND tenant_id = $2;

-- name: CreateRecurrenceException :one
INSERT INTO recurrence_exceptions (rule_id, exception_date)
VALUES ($1, $2)
RETURNING id, rule_id, exception_date, created_at;

-- name: ListRecurrenceExceptionsByRule :many
SELECT id, rule_id, exception_date, created_at
FROM recurrence_exceptions
WHERE rule_id = $1
ORDER BY exception_date;

-- name: DeleteRecurrenceException :exec
DELETE FROM recurrence_exceptions WHERE id = $1;
