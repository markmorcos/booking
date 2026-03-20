package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/markmorcos/booking/backend/internal/middleware"
	"github.com/markmorcos/booking/backend/internal/service"
)

type AdminSlotsHandler struct {
	slotService *service.SlotService
}

func NewAdminSlotsHandler(slotService *service.SlotService) *AdminSlotsHandler {
	return &AdminSlotsHandler{slotService: slotService}
}

type createSlotRequest struct {
	StartsAt string `json:"starts_at"`
	EndsAt   string `json:"ends_at"`
}

func (h *AdminSlotsHandler) Create(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	var req createSlotRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.StartsAt == "" || req.EndsAt == "" {
		writeError(w, http.StatusBadRequest, "starts_at and ends_at are required")
		return
	}

	startsAt, err := parseDateTime(req.StartsAt)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid starts_at format, use RFC3339")
		return
	}

	endsAt, err := parseDateTime(req.EndsAt)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid ends_at format, use RFC3339")
		return
	}

	slot, err := h.slotService.Create(r.Context(), user.TenantID, startsAt, endsAt)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, toSlotResponse(slot))
}

type batchSlotItem struct {
	StartsAt string `json:"starts_at"`
	EndsAt   string `json:"ends_at"`
}

type createBatchSlotsRequest struct {
	Slots []batchSlotItem `json:"slots"`
}

func (h *AdminSlotsHandler) CreateBatch(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	var req createBatchSlotsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if len(req.Slots) == 0 {
		writeError(w, http.StatusBadRequest, "slots array is required and must not be empty")
		return
	}

	var slots []struct {
		StartsAt time.Time
		EndsAt   time.Time
	}

	for _, s := range req.Slots {
		startsAt, err := parseDateTime(s.StartsAt)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid starts_at format in slot")
			return
		}
		endsAt, err := parseDateTime(s.EndsAt)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid ends_at format in slot")
			return
		}
		slots = append(slots, struct {
			StartsAt time.Time
			EndsAt   time.Time
		}{StartsAt: startsAt, EndsAt: endsAt})
	}

	created, err := h.slotService.CreateBatch(r.Context(), user.TenantID, slots)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, toSlotResponses(created))
}

func (h *AdminSlotsHandler) Delete(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	id, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid slot id")
		return
	}

	if err := h.slotService.Delete(r.Context(), id, user.TenantID); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

func (h *AdminSlotsHandler) DeleteRange(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	fromStr := r.URL.Query().Get("from")
	toStr := r.URL.Query().Get("to")

	if fromStr == "" || toStr == "" {
		writeError(w, http.StatusBadRequest, "from and to query parameters are required")
		return
	}

	from, err := parseDate(fromStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid from date")
		return
	}

	to, err := parseDate(toStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid to date")
		return
	}

	to = to.AddDate(0, 0, 1)

	if err := h.slotService.DeleteByRange(r.Context(), user.TenantID, from, to); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}
