package handler

import (
	"encoding/json"
	"net/http"

	"github.com/markmorcos/booking/backend/internal/middleware"
	"github.com/markmorcos/booking/backend/internal/notification"
	"github.com/markmorcos/booking/backend/internal/service"
)

type AdminUsersHandler struct {
	userService *service.UserService
	dispatcher  *notification.Dispatcher
}

func NewAdminUsersHandler(userService *service.UserService, dispatcher *notification.Dispatcher) *AdminUsersHandler {
	return &AdminUsersHandler{
		userService: userService,
		dispatcher:  dispatcher,
	}
}

func (h *AdminUsersHandler) List(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	users, err := h.userService.ListByTenant(r.Context(), user.TenantID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	result := make([]UserResponse, 0, len(users))
	for _, u := range users {
		result = append(result, toUserResponse(u))
	}

	writeJSON(w, http.StatusOK, result)
}

type inviteRequest struct {
	Email string `json:"email"`
	Name  string `json:"name"`
}

func (h *AdminUsersHandler) Invite(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	var req inviteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Email == "" || req.Name == "" {
		writeError(w, http.StatusBadRequest, "email and name are required")
		return
	}

	if err := h.dispatcher.SendInviteEmail(r.Context(), user.TenantID, req.Email, req.Name); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to send invite: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "invited"})
}
