-- name: CreateAppointment :one
INSERT INTO appointments (tenant_id, user_id, slot_id, status, notes)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, tenant_id, user_id, slot_id, status, notes, cancellation_reason, created_at, updated_at;

-- name: GetAppointmentByID :one
SELECT a.id, a.tenant_id, a.user_id, a.slot_id, a.status, a.notes, a.cancellation_reason,
       a.created_at, a.updated_at,
       s.starts_at AS slot_starts_at, s.ends_at AS slot_ends_at
FROM appointments a
JOIN availability_slots s ON a.slot_id = s.id
WHERE a.id = $1;

-- name: ListAppointmentsByUser :many
SELECT a.id, a.tenant_id, a.user_id, a.slot_id, a.status, a.notes, a.cancellation_reason,
       a.created_at, a.updated_at,
       s.starts_at AS slot_starts_at, s.ends_at AS slot_ends_at
FROM appointments a
JOIN availability_slots s ON a.slot_id = s.id
WHERE a.user_id = $1
ORDER BY s.starts_at DESC;

-- name: ListAppointmentsByTenant :many
SELECT a.id, a.tenant_id, a.user_id, a.slot_id, a.status, a.notes, a.cancellation_reason,
       a.created_at, a.updated_at,
       s.starts_at AS slot_starts_at, s.ends_at AS slot_ends_at
FROM appointments a
JOIN availability_slots s ON a.slot_id = s.id
WHERE a.tenant_id = $1
ORDER BY s.starts_at DESC;

-- name: ListAppointmentsByTenantFiltered :many
SELECT a.id, a.tenant_id, a.user_id, a.slot_id, a.status, a.notes, a.cancellation_reason,
       a.created_at, a.updated_at,
       s.starts_at AS slot_starts_at, s.ends_at AS slot_ends_at
FROM appointments a
JOIN availability_slots s ON a.slot_id = s.id
WHERE a.tenant_id = $1
  AND ($2::VARCHAR = '' OR a.status = $2::VARCHAR)
  AND ($3::TIMESTAMPTZ = '0001-01-01' OR s.starts_at >= $3::TIMESTAMPTZ)
  AND ($4::TIMESTAMPTZ = '0001-01-01' OR s.starts_at < $4::TIMESTAMPTZ)
  AND ($5::UUID = '00000000-0000-0000-0000-000000000000' OR a.user_id = $5::UUID)
ORDER BY s.starts_at DESC;

-- name: UpdateAppointmentStatus :one
UPDATE appointments
SET status = $2, updated_at = NOW()
WHERE id = $1
RETURNING id, tenant_id, user_id, slot_id, status, notes, cancellation_reason, created_at, updated_at;

-- name: UpdateAppointmentCancellation :one
UPDATE appointments
SET status = 'cancelled', cancellation_reason = $2, updated_at = NOW()
WHERE id = $1
RETURNING id, tenant_id, user_id, slot_id, status, notes, cancellation_reason, created_at, updated_at;

-- name: UpdateAppointmentReschedule :one
UPDATE appointments
SET status = 'rescheduled', updated_at = NOW()
WHERE id = $1
RETURNING id, tenant_id, user_id, slot_id, status, notes, cancellation_reason, created_at, updated_at;

-- name: GetAppointmentBySlotID :one
SELECT a.id, a.tenant_id, a.user_id, a.slot_id, a.status, a.notes, a.cancellation_reason,
       a.created_at, a.updated_at,
       s.starts_at AS slot_starts_at, s.ends_at AS slot_ends_at
FROM appointments a
JOIN availability_slots s ON a.slot_id = s.id
WHERE a.slot_id = $1 AND a.status NOT IN ('cancelled', 'rescheduled');

-- name: ListTomorrowAppointments :many
SELECT a.id, a.tenant_id, a.user_id, a.slot_id, a.status, a.notes, a.cancellation_reason,
       a.created_at, a.updated_at,
       s.starts_at AS slot_starts_at, s.ends_at AS slot_ends_at
FROM appointments a
JOIN availability_slots s ON a.slot_id = s.id
WHERE a.status IN ('pending', 'confirmed')
  AND s.starts_at >= $1
  AND s.starts_at < $2;
