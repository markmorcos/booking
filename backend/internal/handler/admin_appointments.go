package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/markmorcos/booking/backend/internal/middleware"
	"github.com/markmorcos/booking/backend/internal/notification"
	"github.com/markmorcos/booking/backend/internal/repository"
	"github.com/markmorcos/booking/backend/internal/service"
)

type AdminAppointmentsHandler struct {
	appointmentService *service.AppointmentService
	userService        *service.UserService
	dispatcher         *notification.Dispatcher
}

func NewAdminAppointmentsHandler(appointmentService *service.AppointmentService, userService *service.UserService, dispatcher *notification.Dispatcher) *AdminAppointmentsHandler {
	return &AdminAppointmentsHandler{
		appointmentService: appointmentService,
		userService:        userService,
		dispatcher:         dispatcher,
	}
}

func (h *AdminAppointmentsHandler) List(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	status := r.URL.Query().Get("status")
	fromStr := r.URL.Query().Get("from")
	toStr := r.URL.Query().Get("to")
	userIDStr := r.URL.Query().Get("user_id")

	var from, to time.Time
	var userID uuid.UUID

	if fromStr != "" {
		var err error
		from, err = parseDate(fromStr)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid from date")
			return
		}
	}
	if toStr != "" {
		var err error
		to, err = parseDate(toStr)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid to date")
			return
		}
		to = to.AddDate(0, 0, 1)
	}
	if userIDStr != "" {
		var err error
		userID, err = parseUUID(userIDStr)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid user_id")
			return
		}
	}

	appointments, err := h.appointmentService.ListByTenantFiltered(r.Context(), repository.ListAppointmentsFilteredParams{
		TenantID: user.TenantID,
		Status:   status,
		From:     from,
		To:       to,
		UserID:   userID,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, toAppointmentResponses(appointments))
}

func (h *AdminAppointmentsHandler) Confirm(w http.ResponseWriter, r *http.Request) {
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

	appt, err := h.appointmentService.Confirm(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	if appt.TenantID != user.TenantID {
		writeError(w, http.StatusForbidden, "appointment not in your tenant")
		return
	}

	apptUser, err := h.userService.GetByID(r.Context(), appt.UserID)
	if err == nil {
		h.dispatcher.Dispatch(r.Context(), "appointment_confirmed", appt.ID, apptUser)
	}

	writeJSON(w, http.StatusOK, toAppointmentResponse(appt))
}

func (h *AdminAppointmentsHandler) Cancel(w http.ResponseWriter, r *http.Request) {
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

	// Verify tenant
	existing, err := h.appointmentService.GetByID(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "appointment not found")
		return
	}
	if existing.TenantID != user.TenantID {
		writeError(w, http.StatusForbidden, "appointment not in your tenant")
		return
	}

	var req cancelRequest
	json.NewDecoder(r.Body).Decode(&req)

	appt, err := h.appointmentService.Cancel(r.Context(), id, req.Reason)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	apptUser, err := h.userService.GetByID(r.Context(), appt.UserID)
	if err == nil {
		h.dispatcher.Dispatch(r.Context(), "appointment_cancelled", appt.ID, apptUser)
	}

	writeJSON(w, http.StatusOK, toAppointmentResponse(appt))
}

func (h *AdminAppointmentsHandler) Reschedule(w http.ResponseWriter, r *http.Request) {
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

	existing, err := h.appointmentService.GetByID(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "appointment not found")
		return
	}
	if existing.TenantID != user.TenantID {
		writeError(w, http.StatusForbidden, "appointment not in your tenant")
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

	apptUser, err := h.userService.GetByID(r.Context(), appt.UserID)
	if err == nil {
		h.dispatcher.Dispatch(r.Context(), "appointment_rescheduled", appt.ID, apptUser)
	}

	writeJSON(w, http.StatusOK, toAppointmentResponse(appt))
}

func (h *AdminAppointmentsHandler) Complete(w http.ResponseWriter, r *http.Request) {
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

	appt, err := h.appointmentService.Complete(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	if appt.TenantID != user.TenantID {
		writeError(w, http.StatusForbidden, "appointment not in your tenant")
		return
	}

	apptUser, err := h.userService.GetByID(r.Context(), appt.UserID)
	if err == nil {
		h.dispatcher.Dispatch(r.Context(), "appointment_completed", appt.ID, apptUser)
	}

	writeJSON(w, http.StatusOK, toAppointmentResponse(appt))
}

func (h *AdminAppointmentsHandler) NoShow(w http.ResponseWriter, r *http.Request) {
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

	appt, err := h.appointmentService.NoShow(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	if appt.TenantID != user.TenantID {
		writeError(w, http.StatusForbidden, "appointment not in your tenant")
		return
	}

	apptUser, err := h.userService.GetByID(r.Context(), appt.UserID)
	if err == nil {
		h.dispatcher.Dispatch(r.Context(), "no_show", appt.ID, apptUser)
	}

	writeJSON(w, http.StatusOK, toAppointmentResponse(appt))
}
