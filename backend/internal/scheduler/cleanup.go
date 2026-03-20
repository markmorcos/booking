package scheduler

import (
	"context"
	"log"
	"time"

	"github.com/markmorcos/booking/backend/internal/repository"
)

type Cleanup struct {
	queries *repository.Queries
}

func NewCleanup(queries *repository.Queries) *Cleanup {
	return &Cleanup{queries: queries}
}

func (c *Cleanup) Run(ctx context.Context) error {
	log.Println("scheduler: cleaning up old slots")

	cutoff := time.Now().UTC().AddDate(0, 0, -90)
	if err := c.queries.DeleteOldSlots(ctx, cutoff); err != nil {
		return err
	}

	log.Println("scheduler: cleanup completed")
	return nil
}
