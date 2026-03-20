package scheduler

import (
	"context"
	"log"

	"github.com/google/uuid"

	"github.com/markmorcos/booking/backend/internal/repository"
	"github.com/markmorcos/booking/backend/internal/service"
)

type Materializer struct {
	queries     *repository.Queries
	slotService *service.SlotService
}

func NewMaterializer(queries *repository.Queries, slotService *service.SlotService) *Materializer {
	return &Materializer{
		queries:     queries,
		slotService: slotService,
	}
}

func (m *Materializer) Run(ctx context.Context) error {
	log.Println("scheduler: materializing slots from recurrence rules")

	rules, err := m.queries.ListAllRecurrenceRules(ctx)
	if err != nil {
		return err
	}

	grouped := make(map[uuid.UUID][]repository.RecurrenceRule)
	for _, rule := range rules {
		grouped[rule.TenantID] = append(grouped[rule.TenantID], rule)
	}

	for tenantID, tenantRules := range grouped {
		if err := m.slotService.MaterializeFromRules(ctx, tenantID, tenantRules, 30); err != nil {
			log.Printf("scheduler: failed to materialize for tenant %s: %v", tenantID, err)
			continue
		}
		log.Printf("scheduler: materialized slots for tenant %s (%d rules)", tenantID, len(tenantRules))
	}

	return nil
}
