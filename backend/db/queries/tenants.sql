-- name: GetTenantByID :one
SELECT id, name, slug, timezone, default_locale, created_at, updated_at
FROM tenants
WHERE id = $1;

-- name: GetTenantBySlug :one
SELECT id, name, slug, timezone, default_locale, created_at, updated_at
FROM tenants
WHERE slug = $1;

-- name: CreateTenant :one
INSERT INTO tenants (name, slug, timezone, default_locale)
VALUES ($1, $2, $3, $4)
RETURNING id, name, slug, timezone, default_locale, created_at, updated_at;
