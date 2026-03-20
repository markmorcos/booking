-- name: GetUserByFirebaseUID :one
SELECT id, tenant_id, firebase_uid, email, name, phone, role, locale,
       notify_email, notify_whatsapp, notify_push, fcm_token, created_at, updated_at
FROM users
WHERE firebase_uid = $1;

-- name: GetUserByID :one
SELECT id, tenant_id, firebase_uid, email, name, phone, role, locale,
       notify_email, notify_whatsapp, notify_push, fcm_token, created_at, updated_at
FROM users
WHERE id = $1;

-- name: GetUserByEmail :one
SELECT id, tenant_id, firebase_uid, email, name, phone, role, locale,
       notify_email, notify_whatsapp, notify_push, fcm_token, created_at, updated_at
FROM users
WHERE email = $1 AND tenant_id = $2;

-- name: CreateUser :one
INSERT INTO users (tenant_id, firebase_uid, email, name, phone, role, locale)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, tenant_id, firebase_uid, email, name, phone, role, locale,
          notify_email, notify_whatsapp, notify_push, fcm_token, created_at, updated_at;

-- name: UpdateUser :one
UPDATE users
SET name = $2, phone = $3, locale = $4, notify_email = $5, notify_whatsapp = $6,
    notify_push = $7, updated_at = NOW()
WHERE id = $1
RETURNING id, tenant_id, firebase_uid, email, name, phone, role, locale,
          notify_email, notify_whatsapp, notify_push, fcm_token, created_at, updated_at;

-- name: UpdateUserFCMToken :exec
UPDATE users SET fcm_token = $2, updated_at = NOW() WHERE id = $1;

-- name: ListUsersByTenant :many
SELECT id, tenant_id, firebase_uid, email, name, phone, role, locale,
       notify_email, notify_whatsapp, notify_push, fcm_token, created_at, updated_at
FROM users
WHERE tenant_id = $1
ORDER BY created_at DESC;

-- name: CountUsersByTenant :one
SELECT COUNT(*) FROM users WHERE tenant_id = $1;

-- name: CountAdminsByTenant :one
SELECT COUNT(*) FROM users WHERE tenant_id = $1 AND role = 'admin';
