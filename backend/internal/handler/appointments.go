package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/markmorcos/booking/backend/internal/middleware"
	"github.com/markmorcos/booking/backend/internal/notification"
	"github.com/markmorcos/booking/backend/internal/repository"
	"github.com/markmorcos/booking/backend/internal/service"
)

type AppointmentsHandler struct {
	appointmentService *service.AppointmentService
	dispatcher         *notification.Dispatcher
	queries            *repository.Queries
}

func NewAppointmentsHandler(appointmentService *service.AppointmentService, dispatcher *notification.Dispatcher, queries *repository.Queries) *AppointmentsHandler {
	return &AppointmentsHandler{
		appointmentService: appointmentService,
		dispatcher:         dispatcher,
		queries:            queries,
	}
}

func (h *AppointmentsHandler) List(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	appointments, err := h.appointmentService.ListByUser(r.Context(), user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, toAppointmentResponses(appointments))
}

type bookRequest struct {
	SlotID string `json:"slot_id"`
	Notes  string `json:"notes"`
}

func (h *AppointmentsHandler) Book(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	var req bookRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.SlotID == "" {
		writeError(w, http.StatusBadRequest, "slot_id is required")
		return
	}

	slotID, err := parseUUID(req.SlotID)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid slot_id")
		return
	}

	appt, err := h.appointmentService.Book(r.Context(), user.TenantID, user.ID, slotID, req.Notes)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, toAppointmentResponse(appt))
}

type cancelRequest struct {
	Reason string `json:"reason"`
}

func (h *AppointmentsHandler) Cancel(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	id, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid appointment id")
		return
	}

	// Verify ownership
	existing, err := h.appointmentService.GetByID(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "appointment not found")
		return
	}
	if existing.UserID != user.ID {
		writeError(w, http.StatusForbidden, "not your appointment")
		return
	}

	var req cancelRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil && err.Error() != "EOF" {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	appt, err := h.appointmentService.Cancel(r.Context(), id, req.Reason)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.dispatcher.Dispatch(r.Context(), "appointment_cancelled", appt.ID, *user)

	writeJSON(w, http.StatusOK, toAppointmentResponse(appt))
}

type rescheduleRequest struct {
	NewSlotID string `json:"new_slot_id"`
}

func (h *AppointmentsHandler) Reschedule(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	id, err := parseUUID(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid appointment id")
		return
	}

	// Verify ownership
	existing, err := h.appointmentService.GetByID(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "appointment not found")
		return
	}
	if existing.UserID != user.ID {
		writeError(w, http.StatusForbidden, "not your appointment")
		return
	}

	var req rescheduleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.NewSlotID == "" {
		writeError(w, http.StatusBadRequest, "new_slot_id is required")
		return
	}

	newSlotID, err := parseUUID(req.NewSlotID)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid new_slot_id")
		return
	}

	appt, err := h.appointmentService.Reschedule(r.Context(), id, newSlotID)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.dispatcher.Dispatch(r.Context(), "appointment_rescheduled", appt.ID, *user)

	writeJSON(w, http.StatusOK, toAppointmentResponse(appt))
}

func toAppointmentResponse(a repository.AppointmentRow) AppointmentResponse {
	return AppointmentResponse{
		ID:                 a.ID,
		TenantID:           a.TenantID,
		UserID:             a.UserID,
		SlotID:             a.SlotID,
		Status:             a.Status,
		Notes:              nullStringPtr(a.Notes),
		CancellationReason: nullStringPtr(a.CancellationReason),
		SlotStartsAt:       a.SlotStartsAt,
		SlotEndsAt:         a.SlotEndsAt,
		CreatedAt:          a.CreatedAt,
		UpdatedAt:          a.UpdatedAt,
	}
}

func toAppointmentResponses(appointments []repository.AppointmentRow) []AppointmentResponse {
	result := make([]AppointmentResponse, 0, len(appointments))
	for _, a := range appointments {
		result = append(result, toAppointmentResponse(a))
	}
	return result
}
