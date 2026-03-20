package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
)

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func parseUUID(s string) (uuid.UUID, error) {
	return uuid.Parse(s)
}

func parseDate(s string) (time.Time, error) {
	return time.Parse("2006-01-02", s)
}

func parseDateTime(s string) (time.Time, error) {
	return time.Parse(time.RFC3339, s)
}

type UserResponse struct {
	ID             uuid.UUID `json:"id"`
	TenantID       uuid.UUID `json:"tenant_id"`
	Email          string    `json:"email"`
	Name           string    `json:"name"`
	Phone          *string   `json:"phone"`
	Role           string    `json:"role"`
	Locale         string    `json:"locale"`
	NotifyEmail    bool      `json:"notify_email"`
	NotifyWhatsapp bool      `json:"notify_whatsapp"`
	NotifyPush     bool      `json:"notify_push"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func nullStringPtr(ns sql.NullString) *string {
	if ns.Valid {
		return &ns.String
	}
	return nil
}

type AppointmentResponse struct {
	ID                 uuid.UUID `json:"id"`
	TenantID           uuid.UUID `json:"tenant_id"`
	UserID             uuid.UUID `json:"user_id"`
	SlotID             uuid.UUID `json:"slot_id"`
	Status             string    `json:"status"`
	Notes              *string   `json:"notes"`
	CancellationReason *string   `json:"cancellation_reason"`
	SlotStartsAt       time.Time `json:"slot_starts_at"`
	SlotEndsAt         time.Time `json:"slot_ends_at"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type SlotResponse struct {
	ID          uuid.UUID `json:"id"`
	TenantID    uuid.UUID `json:"tenant_id"`
	StartsAt    time.Time `json:"starts_at"`
	EndsAt      time.Time `json:"ends_at"`
	IsAvailable bool      `json:"is_available"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
