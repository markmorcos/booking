package scheduler

import (
	"context"
	"log"
	"time"

	"github.com/markmorcos/booking/backend/internal/notification"
	"github.com/markmorcos/booking/backend/internal/repository"
)

type Reminder struct {
	queries    *repository.Queries
	dispatcher *notification.Dispatcher
}

func NewReminder(queries *repository.Queries, dispatcher *notification.Dispatcher) *Reminder {
	return &Reminder{
		queries:    queries,
		dispatcher: dispatcher,
	}
}

func (r *Reminder) Run(ctx context.Context) error {
	log.Println("scheduler: sending appointment reminders")

	now := time.Now().UTC()
	tomorrow := now.AddDate(0, 0, 1)
	from := time.Date(tomorrow.Year(), tomorrow.Month(), tomorrow.Day(), 0, 0, 0, 0, time.UTC)
	to := from.AddDate(0, 0, 1)

	appointments, err := r.queries.ListTomorrowAppointments(ctx, from, to)
	if err != nil {
		return err
	}

	for _, appt := range appointments {
		user, err := r.queries.GetUserByID(ctx, appt.UserID)
		if err != nil {
			log.Printf("scheduler: failed to get user %s: %v", appt.UserID, err)
			continue
		}

		r.dispatcher.Dispatch(ctx, "appointment_reminder", appt.ID, user)
	}

	log.Printf("scheduler: sent %d reminders", len(appointments))
	return nil
}
