package notification

import (
	"context"
	"database/sql"
	"log"

	"github.com/google/uuid"

	"github.com/markmorcos/booking/backend/internal/repository"
)

type Dispatcher struct {
	queries  *repository.Queries
	email    *EmailSender
	whatsapp *WhatsAppSender
	fcm      *FCMSender
}

func NewDispatcher(queries *repository.Queries, email *EmailSender, whatsapp *WhatsAppSender, fcm *FCMSender) *Dispatcher {
	return &Dispatcher{
		queries:  queries,
		email:    email,
		whatsapp: whatsapp,
		fcm:      fcm,
	}
}

func (d *Dispatcher) Dispatch(_ context.Context, eventType string, appointmentID uuid.UUID, user repository.User) {
	apptNullID := uuid.NullUUID{UUID: appointmentID, Valid: appointmentID != uuid.Nil}
	// Use background context for async notifications since request context may be cancelled
	bgCtx := context.Background()

	if user.NotifyEmail && user.Email != "" {
		go func() {
			logEntry, _ := d.queries.CreateNotificationLog(bgCtx, repository.CreateNotificationLogParams{
				TenantID:      user.TenantID,
				AppointmentID: apptNullID,
				UserID:        user.ID,
				Channel:       "email",
				EventType:     eventType,
				Status:        "pending",
			})

			err := d.email.Send(bgCtx, eventType, user)
			if err != nil {
				log.Printf("email notification failed for user %s: %v", user.ID, err)
				d.queries.UpdateNotificationLogStatus(bgCtx, logEntry.ID, "failed",
					sql.NullString{String: err.Error(), Valid: true})
				return
			}
			d.queries.UpdateNotificationLogStatus(bgCtx, logEntry.ID, "sent", sql.NullString{})
		}()
	}

	if user.NotifyWhatsapp && user.Phone.Valid && user.Phone.String != "" {
		go func() {
			logEntry, _ := d.queries.CreateNotificationLog(bgCtx, repository.CreateNotificationLogParams{
				TenantID:      user.TenantID,
				AppointmentID: apptNullID,
				UserID:        user.ID,
				Channel:       "whatsapp",
				EventType:     eventType,
				Status:        "pending",
			})

			err := d.whatsapp.Send(bgCtx, eventType, user)
			if err != nil {
				log.Printf("whatsapp notification failed for user %s: %v", user.ID, err)
				d.queries.UpdateNotificationLogStatus(bgCtx, logEntry.ID, "failed",
					sql.NullString{String: err.Error(), Valid: true})
				return
			}
			d.queries.UpdateNotificationLogStatus(bgCtx, logEntry.ID, "sent", sql.NullString{})
		}()
	}

	if user.NotifyPush && user.FCMToken.Valid && user.FCMToken.String != "" {
		go func() {
			logEntry, _ := d.queries.CreateNotificationLog(bgCtx, repository.CreateNotificationLogParams{
				TenantID:      user.TenantID,
				AppointmentID: apptNullID,
				UserID:        user.ID,
				Channel:       "push",
				EventType:     eventType,
				Status:        "pending",
			})

			err := d.fcm.Send(bgCtx, eventType, user)
			if err != nil {
				log.Printf("fcm notification failed for user %s: %v", user.ID, err)
				d.queries.UpdateNotificationLogStatus(bgCtx, logEntry.ID, "failed",
					sql.NullString{String: err.Error(), Valid: true})
				return
			}
			d.queries.UpdateNotificationLogStatus(bgCtx, logEntry.ID, "sent", sql.NullString{})
		}()
	}
}

func (d *Dispatcher) SendInviteEmail(ctx context.Context, tenantID uuid.UUID, email, name string) error {
	return d.email.SendInvite(ctx, email, name)
}
