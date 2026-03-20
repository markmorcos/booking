package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/markmorcos/booking/backend/internal/middleware"
	"github.com/markmorcos/booking/backend/internal/repository"
	"github.com/markmorcos/booking/backend/internal/service"
)

type SlotsHandler struct {
	slotService *service.SlotService
}

func NewSlotsHandler(slotService *service.SlotService) *SlotsHandler {
	return &SlotsHandler{slotService: slotService}
}

func (h *SlotsHandler) List(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	fromStr := r.URL.Query().Get("from")
	toStr := r.URL.Query().Get("to")

	if fromStr == "" || toStr == "" {
		writeError(w, http.StatusBadRequest, "from and to query parameters are required (YYYY-MM-DD)")
		return
	}

	from, err := parseDate(fromStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid from date format, use YYYY-MM-DD")
		return
	}

	to, err := parseDate(toStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid to date format, use YYYY-MM-DD")
		return
	}

	// Add one day to "to" to make it inclusive
	to = to.AddDate(0, 0, 1)

	slots, err := h.slotService.ListAvailable(r.Context(), user.TenantID, from, to)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, toSlotResponses(slots))
}

func (h *SlotsHandler) Get(w http.ResponseWriter, r *http.Request) {
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

	slot, err := h.slotService.GetByID(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "slot not found")
		return
	}

	if slot.TenantID != user.TenantID {
		writeError(w, http.StatusNotFound, "slot not found")
		return
	}

	writeJSON(w, http.StatusOK, toSlotResponse(slot))
}

func toSlotResponse(s repository.AvailabilitySlot) SlotResponse {
	return SlotResponse{
		ID:          s.ID,
		TenantID:    s.TenantID,
		StartsAt:    s.StartsAt,
		EndsAt:      s.EndsAt,
		IsAvailable: s.IsAvailable,
		CreatedAt:   s.CreatedAt,
		UpdatedAt:   s.UpdatedAt,
	}
}

func toSlotResponses(slots []repository.AvailabilitySlot) []SlotResponse {
	result := make([]SlotResponse, 0, len(slots))
	for _, s := range slots {
		result = append(result, toSlotResponse(s))
	}
	return result
}
