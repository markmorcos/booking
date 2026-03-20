package notification

import (
	"context"
	"fmt"

	"firebase.google.com/go/v4/messaging"

	"github.com/markmorcos/booking/backend/internal/i18n"
	"github.com/markmorcos/booking/backend/internal/repository"
)

type FCMSender struct {
	client *messaging.Client
}

func NewFCMSender(client *messaging.Client) *FCMSender {
	return &FCMSender{client: client}
}

func (f *FCMSender) Send(ctx context.Context, eventType string, user repository.User) error {
	if f.client == nil {
		return fmt.Errorf("FCM client not configured")
	}

	if !user.FCMToken.Valid || user.FCMToken.String == "" {
		return fmt.Errorf("user has no FCM token")
	}

	title := i18n.T(eventType, user.Locale)

	msg := &messaging.Message{
		Token: user.FCMToken.String,
		Notification: &messaging.Notification{
			Title: title,
			Body:  title,
		},
		Data: map[string]string{
			"event_type": eventType,
			"user_id":    user.ID.String(),
		},
	}

	_, err := f.client.Send(ctx, msg)
	if err != nil {
		return fmt.Errorf("failed to send FCM message: %w", err)
	}

	return nil
}
