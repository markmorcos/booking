package repository

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type Tenant struct {
	ID            uuid.UUID `json:"id"`
	Name          string    `json:"name"`
	Slug          string    `json:"slug"`
	Timezone      string    `json:"timezone"`
	DefaultLocale string    `json:"default_locale"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type User struct {
	ID              uuid.UUID      `json:"id"`
	TenantID        uuid.UUID      `json:"tenant_id"`
	FirebaseUID     string         `json:"firebase_uid"`
	Email           string         `json:"email"`
	Name            string         `json:"name"`
	Phone           sql.NullString `json:"phone"`
	Role            string         `json:"role"`
	Locale          string         `json:"locale"`
	NotifyEmail     bool           `json:"notify_email"`
	NotifyWhatsapp  bool           `json:"notify_whatsapp"`
	NotifyPush      bool           `json:"notify_push"`
	FCMToken        sql.NullString `json:"fcm_token"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
}

type RecurrenceRule struct {
	ID                  uuid.UUID    `json:"id"`
	TenantID            uuid.UUID    `json:"tenant_id"`
	DayOfWeek           int32        `json:"day_of_week"`
	StartTime           string       `json:"start_time"`
	EndTime             string       `json:"end_time"`
	SlotDurationMinutes int32        `json:"slot_duration_minutes"`
	EffectiveFrom       time.Time    `json:"effective_from"`
	EffectiveUntil      sql.NullTime `json:"effective_until"`
	CreatedAt           time.Time    `json:"created_at"`
	UpdatedAt           time.Time    `json:"updated_at"`
}

type RecurrenceException struct {
	ID            uuid.UUID `json:"id"`
	RuleID        uuid.UUID `json:"rule_id"`
	ExceptionDate time.Time `json:"exception_date"`
	CreatedAt     time.Time `json:"created_at"`
}

type AvailabilitySlot struct {
	ID               uuid.UUID     `json:"id"`
	TenantID         uuid.UUID     `json:"tenant_id"`
	RecurrenceRuleID uuid.NullUUID `json:"recurrence_rule_id"`
	StartsAt         time.Time     `json:"starts_at"`
	EndsAt           time.Time     `json:"ends_at"`
	IsAvailable      bool          `json:"is_available"`
	CreatedAt        time.Time     `json:"created_at"`
	UpdatedAt        time.Time     `json:"updated_at"`
}

type AppointmentRow struct {
	ID                 uuid.UUID      `json:"id"`
	TenantID           uuid.UUID      `json:"tenant_id"`
	UserID             uuid.UUID      `json:"user_id"`
	SlotID             uuid.UUID      `json:"slot_id"`
	Status             string         `json:"status"`
	Notes              sql.NullString `json:"notes"`
	CancellationReason sql.NullString `json:"cancellation_reason"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	SlotStartsAt       time.Time      `json:"slot_starts_at"`
	SlotEndsAt         time.Time      `json:"slot_ends_at"`
}

type NotificationLog struct {
	ID            uuid.UUID      `json:"id"`
	TenantID      uuid.UUID      `json:"tenant_id"`
	AppointmentID uuid.NullUUID  `json:"appointment_id"`
	UserID        uuid.UUID      `json:"user_id"`
	Channel       string         `json:"channel"`
	EventType     string         `json:"event_type"`
	Status        string         `json:"status"`
	ErrorMessage  sql.NullString `json:"error_message"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
}
