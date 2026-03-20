package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/markmorcos/booking/backend/internal/middleware"
	"github.com/markmorcos/booking/backend/internal/repository"
	"github.com/markmorcos/booking/backend/internal/service"
)

type AdminRecurrenceHandler struct {
	queries     *repository.Queries
	slotService *service.SlotService
}

func NewAdminRecurrenceHandler(queries *repository.Queries, slotService *service.SlotService) *AdminRecurrenceHandler {
	return &AdminRecurrenceHandler{
		queries:     queries,
		slotService: slotService,
	}
}

type RecurrenceRuleResponse struct {
	ID                  string  `json:"id"`
	TenantID            string  `json:"tenant_id"`
	DayOfWeek           int32   `json:"day_of_week"`
	StartTime           string  `json:"start_time"`
	EndTime             string  `json:"end_time"`
	SlotDurationMinutes int32   `json:"slot_duration_minutes"`
	EffectiveFrom       string  `json:"effective_from"`
	EffectiveUntil      *string `json:"effective_until"`
	CreatedAt           string  `json:"created_at"`
	UpdatedAt           string  `json:"updated_at"`
}

func toRecurrenceRuleResponse(r repository.RecurrenceRule) RecurrenceRuleResponse {
	resp := RecurrenceRuleResponse{
		ID:                  r.ID.String(),
		TenantID:            r.TenantID.String(),
		DayOfWeek:           r.DayOfWeek,
		StartTime:           r.StartTime,
		EndTime:             r.EndTime,
		SlotDurationMinutes: r.SlotDurationMinutes,
		EffectiveFrom:       r.EffectiveFrom.Format("2006-01-02"),
		CreatedAt:           r.CreatedAt.Format(time.RFC3339),
		UpdatedAt:           r.UpdatedAt.Format(time.RFC3339),
	}
	if r.EffectiveUntil.Valid {
		s := r.EffectiveUntil.Time.Format("2006-01-02")
		resp.EffectiveUntil = &s
	}
	return resp
}

func (h *AdminRecurrenceHandler) List(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	rules, err := h.queries.ListRecurrenceRulesByTenant(r.Context(), user.TenantID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	result := make([]RecurrenceRuleResponse, 0, len(rules))
	for _, rule := range rules {
		result = append(result, toRecurrenceRuleResponse(rule))
	}

	writeJSON(w, http.StatusOK, result)
}

type createRecurrenceRuleRequest struct {
	DayOfWeek           int32  `json:"day_of_week"`
	StartTime           string `json:"start_time"`
	EndTime             string `json:"end_time"`
	SlotDurationMinutes int32  `json:"slot_duration_minutes"`
	EffectiveFrom       string `json:"effective_from"`
	EffectiveUntil      string `json:"effective_until"`
}

func (h *AdminRecurrenceHandler) Create(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	var req createRecurrenceRuleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.StartTime == "" || req.EndTime == "" || req.EffectiveFrom == "" || req.SlotDurationMinutes <= 0 {
		writeError(w, http.StatusBadRequest, "start_time, end_time, effective_from, and slot_duration_minutes are required")
		return
	}

	if req.DayOfWeek < 0 || req.DayOfWeek > 6 {
		writeError(w, http.StatusBadRequest, "day_of_week must be 0-6")
		return
	}

	effectiveFrom, err := parseDate(req.EffectiveFrom)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid effective_from date")
		return
	}

	var effectiveUntil sql.NullTime
	if req.EffectiveUntil != "" {
		t, err := parseDate(req.EffectiveUntil)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid effective_until date")
			return
		}
		effectiveUntil = sql.NullTime{Time: t, Valid: true}
	}

	rule, err := h.queries.CreateRecurrenceRule(r.Context(), repository.CreateRecurrenceRuleParams{
		TenantID:            user.TenantID,
		DayOfWeek:           req.DayOfWeek,
		StartTime:           req.StartTime,
		EndTime:             req.EndTime,
		SlotDurationMinutes: req.SlotDurationMinutes,
		EffectiveFrom:       effectiveFrom,
		EffectiveUntil:      effectiveUntil,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, toRecurrenceRuleResponse(rule))
}

func (h *AdminRecurrenceHandler) Update(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	id, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid rule id")
		return
	}

	var req createRecurrenceRuleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	effectiveFrom, err := parseDate(req.EffectiveFrom)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid effective_from date")
		return
	}

	var effectiveUntil sql.NullTime
	if req.EffectiveUntil != "" {
		t, err := parseDate(req.EffectiveUntil)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid effective_until date")
			return
		}
		effectiveUntil = sql.NullTime{Time: t, Valid: true}
	}

	rule, err := h.queries.UpdateRecurrenceRule(r.Context(), repository.UpdateRecurrenceRuleParams{
		ID:                  id,
		TenantID:            user.TenantID,
		DayOfWeek:           req.DayOfWeek,
		StartTime:           req.StartTime,
		EndTime:             req.EndTime,
		SlotDurationMinutes: req.SlotDurationMinutes,
		EffectiveFrom:       effectiveFrom,
		EffectiveUntil:      effectiveUntil,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, toRecurrenceRuleResponse(rule))
}

func (h *AdminRecurrenceHandler) Delete(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	id, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid rule id")
		return
	}

	if err := h.queries.DeleteRecurrenceRule(r.Context(), id, user.TenantID); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

type createExceptionRequest struct {
	ExceptionDate string `json:"exception_date"`
}

func (h *AdminRecurrenceHandler) CreateException(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	ruleID, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid rule id")
		return
	}

	// Verify rule belongs to tenant
	_, err = h.queries.GetRecurrenceRuleByID(r.Context(), ruleID, user.TenantID)
	if err != nil {
		writeError(w, http.StatusNotFound, "recurrence rule not found")
		return
	}

	var req createExceptionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.ExceptionDate == "" {
		writeError(w, http.StatusBadRequest, "exception_date is required")
		return
	}

	exDate, err := parseDate(req.ExceptionDate)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid exception_date format")
		return
	}

	exception, err := h.queries.CreateRecurrenceException(r.Context(), ruleID, exDate)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, map[string]interface{}{
		"id":             exception.ID.String(),
		"rule_id":        exception.RuleID.String(),
		"exception_date": exception.ExceptionDate.Format("2006-01-02"),
		"created_at":     exception.CreatedAt.Format(time.RFC3339),
	})
}

func (h *AdminRecurrenceHandler) Materialize(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	rules, err := h.queries.ListRecurrenceRulesByTenant(r.Context(), user.TenantID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if err := h.slotService.MaterializeFromRules(r.Context(), user.TenantID, rules, 30); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "materialized"})
}
