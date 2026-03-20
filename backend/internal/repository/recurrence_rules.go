package repository

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type CreateRecurrenceRuleParams struct {
	TenantID            uuid.UUID
	DayOfWeek           int32
	StartTime           string
	EndTime             string
	SlotDurationMinutes int32
	EffectiveFrom       time.Time
	EffectiveUntil      sql.NullTime
}

func (q *Queries) CreateRecurrenceRule(ctx context.Context, arg CreateRecurrenceRuleParams) (RecurrenceRule, error) {
	row := q.db.QueryRowContext(ctx,
		`INSERT INTO recurrence_rules (tenant_id, day_of_week, start_time, end_time, slot_duration_minutes, effective_from, effective_until)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING id, tenant_id, day_of_week, start_time, end_time, slot_duration_minutes, effective_from, effective_until, created_at, updated_at`,
		arg.TenantID, arg.DayOfWeek, arg.StartTime, arg.EndTime, arg.SlotDurationMinutes, arg.EffectiveFrom, arg.EffectiveUntil)
	var r RecurrenceRule
	err := row.Scan(&r.ID, &r.TenantID, &r.DayOfWeek, &r.StartTime, &r.EndTime, &r.SlotDurationMinutes,
		&r.EffectiveFrom, &r.EffectiveUntil, &r.CreatedAt, &r.UpdatedAt)
	return r, err
}

func (q *Queries) GetRecurrenceRuleByID(ctx context.Context, id uuid.UUID, tenantID uuid.UUID) (RecurrenceRule, error) {
	row := q.db.QueryRowContext(ctx,
		`SELECT id, tenant_id, day_of_week, start_time, end_time, slot_duration_minutes, effective_from, effective_until, created_at, updated_at
		 FROM recurrence_rules WHERE id = $1 AND tenant_id = $2`, id, tenantID)
	var r RecurrenceRule
	err := row.Scan(&r.ID, &r.TenantID, &r.DayOfWeek, &r.StartTime, &r.EndTime, &r.SlotDurationMinutes,
		&r.EffectiveFrom, &r.EffectiveUntil, &r.CreatedAt, &r.UpdatedAt)
	return r, err
}

func (q *Queries) ListRecurrenceRulesByTenant(ctx context.Context, tenantID uuid.UUID) ([]RecurrenceRule, error) {
	rows, err := q.db.QueryContext(ctx,
		`SELECT id, tenant_id, day_of_week, start_time, end_time, slot_duration_minutes, effective_from, effective_until, created_at, updated_at
		 FROM recurrence_rules WHERE tenant_id = $1 ORDER BY day_of_week, start_time`, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var rules []RecurrenceRule
	for rows.Next() {
		var r RecurrenceRule
		if err := rows.Scan(&r.ID, &r.TenantID, &r.DayOfWeek, &r.StartTime, &r.EndTime, &r.SlotDurationMinutes,
			&r.EffectiveFrom, &r.EffectiveUntil, &r.CreatedAt, &r.UpdatedAt); err != nil {
			return nil, err
		}
		rules = append(rules, r)
	}
	return rules, rows.Err()
}

type UpdateRecurrenceRuleParams struct {
	ID                  uuid.UUID
	TenantID            uuid.UUID
	DayOfWeek           int32
	StartTime           string
	EndTime             string
	SlotDurationMinutes int32
	EffectiveFrom       time.Time
	EffectiveUntil      sql.NullTime
}

func (q *Queries) UpdateRecurrenceRule(ctx context.Context, arg UpdateRecurrenceRuleParams) (RecurrenceRule, error) {
	row := q.db.QueryRowContext(ctx,
		`UPDATE recurrence_rules
		 SET day_of_week = $3, start_time = $4, end_time = $5, slot_duration_minutes = $6,
		     effective_from = $7, effective_until = $8, updated_at = NOW()
		 WHERE id = $1 AND tenant_id = $2
		 RETURNING id, tenant_id, day_of_week, start_time, end_time, slot_duration_minutes, effective_from, effective_until, created_at, updated_at`,
		arg.ID, arg.TenantID, arg.DayOfWeek, arg.StartTime, arg.EndTime, arg.SlotDurationMinutes, arg.EffectiveFrom, arg.EffectiveUntil)
	var r RecurrenceRule
	err := row.Scan(&r.ID, &r.TenantID, &r.DayOfWeek, &r.StartTime, &r.EndTime, &r.SlotDurationMinutes,
		&r.EffectiveFrom, &r.EffectiveUntil, &r.CreatedAt, &r.UpdatedAt)
	return r, err
}

func (q *Queries) DeleteRecurrenceRule(ctx context.Context, id uuid.UUID, tenantID uuid.UUID) error {
	_, err := q.db.ExecContext(ctx,
		`DELETE FROM recurrence_rules WHERE id = $1 AND tenant_id = $2`, id, tenantID)
	return err
}

func (q *Queries) CreateRecurrenceException(ctx context.Context, ruleID uuid.UUID, exceptionDate time.Time) (RecurrenceException, error) {
	row := q.db.QueryRowContext(ctx,
		`INSERT INTO recurrence_exceptions (rule_id, exception_date) VALUES ($1, $2)
		 RETURNING id, rule_id, exception_date, created_at`, ruleID, exceptionDate)
	var e RecurrenceException
	err := row.Scan(&e.ID, &e.RuleID, &e.ExceptionDate, &e.CreatedAt)
	return e, err
}

func (q *Queries) ListRecurrenceExceptionsByRule(ctx context.Context, ruleID uuid.UUID) ([]RecurrenceException, error) {
	rows, err := q.db.QueryContext(ctx,
		`SELECT id, rule_id, exception_date, created_at FROM recurrence_exceptions WHERE rule_id = $1 ORDER BY exception_date`, ruleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var exceptions []RecurrenceException
	for rows.Next() {
		var e RecurrenceException
		if err := rows.Scan(&e.ID, &e.RuleID, &e.ExceptionDate, &e.CreatedAt); err != nil {
			return nil, err
		}
		exceptions = append(exceptions, e)
	}
	return exceptions, rows.Err()
}

func (q *Queries) DeleteRecurrenceException(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.ExecContext(ctx, `DELETE FROM recurrence_exceptions WHERE id = $1`, id)
	return err
}

func (q *Queries) ListAllRecurrenceRules(ctx context.Context) ([]RecurrenceRule, error) {
	rows, err := q.db.QueryContext(ctx,
		`SELECT id, tenant_id, day_of_week, start_time, end_time, slot_duration_minutes, effective_from, effective_until, created_at, updated_at
		 FROM recurrence_rules ORDER BY tenant_id, day_of_week, start_time`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var rules []RecurrenceRule
	for rows.Next() {
		var r RecurrenceRule
		if err := rows.Scan(&r.ID, &r.TenantID, &r.DayOfWeek, &r.StartTime, &r.EndTime, &r.SlotDurationMinutes,
			&r.EffectiveFrom, &r.EffectiveUntil, &r.CreatedAt, &r.UpdatedAt); err != nil {
			return nil, err
		}
		rules = append(rules, r)
	}
	return rules, rows.Err()
}
