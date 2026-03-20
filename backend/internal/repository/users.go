package repository

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
)

func (q *Queries) GetUserByFirebaseUID(ctx context.Context, firebaseUID string) (User, error) {
	row := q.db.QueryRowContext(ctx,
		`SELECT id, tenant_id, firebase_uid, email, name, phone, role, locale,
		        notify_email, notify_whatsapp, notify_push, fcm_token, created_at, updated_at
		 FROM users WHERE firebase_uid = $1`, firebaseUID)
	var u User
	err := row.Scan(&u.ID, &u.TenantID, &u.FirebaseUID, &u.Email, &u.Name, &u.Phone, &u.Role, &u.Locale,
		&u.NotifyEmail, &u.NotifyWhatsapp, &u.NotifyPush, &u.FCMToken, &u.CreatedAt, &u.UpdatedAt)
	return u, err
}

func (q *Queries) GetUserByID(ctx context.Context, id uuid.UUID) (User, error) {
	row := q.db.QueryRowContext(ctx,
		`SELECT id, tenant_id, firebase_uid, email, name, phone, role, locale,
		        notify_email, notify_whatsapp, notify_push, fcm_token, created_at, updated_at
		 FROM users WHERE id = $1`, id)
	var u User
	err := row.Scan(&u.ID, &u.TenantID, &u.FirebaseUID, &u.Email, &u.Name, &u.Phone, &u.Role, &u.Locale,
		&u.NotifyEmail, &u.NotifyWhatsapp, &u.NotifyPush, &u.FCMToken, &u.CreatedAt, &u.UpdatedAt)
	return u, err
}

func (q *Queries) GetUserByEmail(ctx context.Context, email string, tenantID uuid.UUID) (User, error) {
	row := q.db.QueryRowContext(ctx,
		`SELECT id, tenant_id, firebase_uid, email, name, phone, role, locale,
		        notify_email, notify_whatsapp, notify_push, fcm_token, created_at, updated_at
		 FROM users WHERE email = $1 AND tenant_id = $2`, email, tenantID)
	var u User
	err := row.Scan(&u.ID, &u.TenantID, &u.FirebaseUID, &u.Email, &u.Name, &u.Phone, &u.Role, &u.Locale,
		&u.NotifyEmail, &u.NotifyWhatsapp, &u.NotifyPush, &u.FCMToken, &u.CreatedAt, &u.UpdatedAt)
	return u, err
}

type CreateUserParams struct {
	TenantID    uuid.UUID
	FirebaseUID string
	Email       string
	Name        string
	Phone       sql.NullString
	Role        string
	Locale      string
}

func (q *Queries) CreateUser(ctx context.Context, arg CreateUserParams) (User, error) {
	row := q.db.QueryRowContext(ctx,
		`INSERT INTO users (tenant_id, firebase_uid, email, name, phone, role, locale)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING id, tenant_id, firebase_uid, email, name, phone, role, locale,
		           notify_email, notify_whatsapp, notify_push, fcm_token, created_at, updated_at`,
		arg.TenantID, arg.FirebaseUID, arg.Email, arg.Name, arg.Phone, arg.Role, arg.Locale)
	var u User
	err := row.Scan(&u.ID, &u.TenantID, &u.FirebaseUID, &u.Email, &u.Name, &u.Phone, &u.Role, &u.Locale,
		&u.NotifyEmail, &u.NotifyWhatsapp, &u.NotifyPush, &u.FCMToken, &u.CreatedAt, &u.UpdatedAt)
	return u, err
}

type UpdateUserParams struct {
	ID             uuid.UUID
	Name           string
	Phone          sql.NullString
	Locale         string
	NotifyEmail    bool
	NotifyWhatsapp bool
	NotifyPush     bool
}

func (q *Queries) UpdateUser(ctx context.Context, arg UpdateUserParams) (User, error) {
	row := q.db.QueryRowContext(ctx,
		`UPDATE users SET name = $2, phone = $3, locale = $4, notify_email = $5,
		        notify_whatsapp = $6, notify_push = $7, updated_at = NOW()
		 WHERE id = $1
		 RETURNING id, tenant_id, firebase_uid, email, name, phone, role, locale,
		           notify_email, notify_whatsapp, notify_push, fcm_token, created_at, updated_at`,
		arg.ID, arg.Name, arg.Phone, arg.Locale, arg.NotifyEmail, arg.NotifyWhatsapp, arg.NotifyPush)
	var u User
	err := row.Scan(&u.ID, &u.TenantID, &u.FirebaseUID, &u.Email, &u.Name, &u.Phone, &u.Role, &u.Locale,
		&u.NotifyEmail, &u.NotifyWhatsapp, &u.NotifyPush, &u.FCMToken, &u.CreatedAt, &u.UpdatedAt)
	return u, err
}

func (q *Queries) UpdateUserFCMToken(ctx context.Context, id uuid.UUID, token string) error {
	_, err := q.db.ExecContext(ctx,
		`UPDATE users SET fcm_token = $2, updated_at = NOW() WHERE id = $1`, id, token)
	return err
}

func (q *Queries) ListUsersByTenant(ctx context.Context, tenantID uuid.UUID) ([]User, error) {
	rows, err := q.db.QueryContext(ctx,
		`SELECT id, tenant_id, firebase_uid, email, name, phone, role, locale,
		        notify_email, notify_whatsapp, notify_push, fcm_token, created_at, updated_at
		 FROM users WHERE tenant_id = $1 ORDER BY created_at DESC`, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var users []User
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.TenantID, &u.FirebaseUID, &u.Email, &u.Name, &u.Phone, &u.Role, &u.Locale,
			&u.NotifyEmail, &u.NotifyWhatsapp, &u.NotifyPush, &u.FCMToken, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, rows.Err()
}

func (q *Queries) CountAdminsByTenant(ctx context.Context, tenantID uuid.UUID) (int64, error) {
	row := q.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM users WHERE tenant_id = $1 AND role = 'admin'`, tenantID)
	var count int64
	err := row.Scan(&count)
	return count, err
}
