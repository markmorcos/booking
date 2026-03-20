-- name: CreateAvailabilitySlot :one
INSERT INTO availability_slots (tenant_id, recurrence_rule_id, starts_at, ends_at, is_available)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, tenant_id, recurrence_rule_id, starts_at, ends_at, is_available, created_at, updated_at;

-- name: GetAvailabilitySlotByID :one
SELECT id, tenant_id, recurrence_rule_id, starts_at, ends_at, is_available, created_at, updated_at
FROM availability_slots
WHERE id = $1;

-- name: ListAvailableSlots :many
SELECT id, tenant_id, recurrence_rule_id, starts_at, ends_at, is_available, created_at, updated_at
FROM availability_slots
WHERE tenant_id = $1 AND is_available = true AND starts_at >= $2 AND starts_at < $3
ORDER BY starts_at;

-- name: DeleteAvailabilitySlot :exec
DELETE FROM availability_slots WHERE id = $1 AND tenant_id = $2;

-- name: DeleteAvailabilitySlotsByRange :exec
DELETE FROM availability_slots
WHERE tenant_id = $1 AND starts_at >= $2 AND starts_at < $3;

-- name: MarkSlotUnavailable :exec
UPDATE availability_slots SET is_available = false, updated_at = NOW()
WHERE id = $1;

-- name: MarkSlotAvailable :exec
UPDATE availability_slots SET is_available = true, updated_at = NOW()
WHERE id = $1;

-- name: DeleteOldSlots :exec
DELETE FROM availability_slots
WHERE starts_at < $1 AND is_available = true
AND id NOT IN (SELECT slot_id FROM appointments WHERE status NOT IN ('cancelled', 'completed', 'no_show'));

-- name: GetSlotByTenantAndTime :one
SELECT id, tenant_id, recurrence_rule_id, starts_at, ends_at, is_available, created_at, updated_at
FROM availability_slots
WHERE tenant_id = $1 AND starts_at = $2 AND ends_at = $3
LIMIT 1;
