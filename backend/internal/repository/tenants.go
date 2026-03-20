package repository

import (
	"context"

	"github.com/google/uuid"
)

func (q *Queries) GetTenantByID(ctx context.Context, id uuid.UUID) (Tenant, error) {
	row := q.db.QueryRowContext(ctx,
		`SELECT id, name, slug, timezone, default_locale, created_at, updated_at FROM tenants WHERE id = $1`, id)
	var t Tenant
	err := row.Scan(&t.ID, &t.Name, &t.Slug, &t.Timezone, &t.DefaultLocale, &t.CreatedAt, &t.UpdatedAt)
	return t, err
}

func (q *Queries) GetTenantBySlug(ctx context.Context, slug string) (Tenant, error) {
	row := q.db.QueryRowContext(ctx,
		`SELECT id, name, slug, timezone, default_locale, created_at, updated_at FROM tenants WHERE slug = $1`, slug)
	var t Tenant
	err := row.Scan(&t.ID, &t.Name, &t.Slug, &t.Timezone, &t.DefaultLocale, &t.CreatedAt, &t.UpdatedAt)
	return t, err
}

func (q *Queries) CreateTenant(ctx context.Context, name, slug, timezone, defaultLocale string) (Tenant, error) {
	row := q.db.QueryRowContext(ctx,
		`INSERT INTO tenants (name, slug, timezone, default_locale) VALUES ($1, $2, $3, $4)
		 RETURNING id, name, slug, timezone, default_locale, created_at, updated_at`,
		name, slug, timezone, defaultLocale)
	var t Tenant
	err := row.Scan(&t.ID, &t.Name, &t.Slug, &t.Timezone, &t.DefaultLocale, &t.CreatedAt, &t.UpdatedAt)
	return t, err
}
