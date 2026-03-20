package scheduler

import (
	"context"
	"log"
	"time"
)

type Scheduler struct {
	materializer *Materializer
	reminder     *Reminder
	cleanup      *Cleanup
}

func NewScheduler(materializer *Materializer, reminder *Reminder, cleanup *Cleanup) *Scheduler {
	return &Scheduler{
		materializer: materializer,
		reminder:     reminder,
		cleanup:      cleanup,
	}
}

func (s *Scheduler) Start(ctx context.Context) {
	go s.runDaily(ctx, "materialize", s.materializer.Run)
	go s.runDaily(ctx, "reminder", s.reminder.Run)
	go s.runWeekly(ctx, "cleanup", s.cleanup.Run)
}

func (s *Scheduler) runDaily(ctx context.Context, name string, fn func(ctx context.Context) error) {
	// Run once at startup
	if err := fn(ctx); err != nil {
		log.Printf("scheduler [%s] initial run error: %v", name, err)
	}

	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Printf("scheduler [%s] stopping", name)
			return
		case <-ticker.C:
			if err := fn(ctx); err != nil {
				log.Printf("scheduler [%s] error: %v", name, err)
			}
		}
	}
}

func (s *Scheduler) runWeekly(ctx context.Context, name string, fn func(ctx context.Context) error) {
	// Run once at startup
	if err := fn(ctx); err != nil {
		log.Printf("scheduler [%s] initial run error: %v", name, err)
	}

	ticker := time.NewTicker(7 * 24 * time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Printf("scheduler [%s] stopping", name)
			return
		case <-ticker.C:
			if err := fn(ctx); err != nil {
				log.Printf("scheduler [%s] error: %v", name, err)
			}
		}
	}
}
