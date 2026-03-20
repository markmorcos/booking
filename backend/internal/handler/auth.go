package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/markmorcos/booking/backend/internal/middleware"
	"github.com/markmorcos/booking/backend/internal/repository"
	"github.com/markmorcos/booking/backend/internal/service"
)

type AuthHandler struct {
	userService *service.UserService
}

func NewAuthHandler(userService *service.UserService) *AuthHandler {
	return &AuthHandler{userService: userService}
}

type registerRequest struct {
	Name       string `json:"name"`
	Phone      string `json:"phone"`
	TenantSlug string `json:"tenant_slug"`
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	token := middleware.FirebaseTokenFromContext(r.Context())
	if token == nil {
		writeError(w, http.StatusUnauthorized, "no token in context")
		return
	}

	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}
	if req.TenantSlug == "" {
		writeError(w, http.StatusBadRequest, "tenant_slug is required")
		return
	}

	email, _ := token.Claims["email"].(string)
	if email == "" {
		writeError(w, http.StatusBadRequest, "email not found in token")
		return
	}

	user, err := h.userService.Register(r.Context(), token.UID, email, req.Name, req.Phone, req.TenantSlug)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, toUserResponse(user))
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}
	writeJSON(w, http.StatusOK, toUserResponse(*user))
}

type updateProfileRequest struct {
	Name           string `json:"name"`
	Phone          string `json:"phone"`
	Locale         string `json:"locale"`
	NotifyEmail    *bool  `json:"notify_email"`
	NotifyWhatsapp *bool  `json:"notify_whatsapp"`
	NotifyPush     *bool  `json:"notify_push"`
}

func (h *AuthHandler) UpdateMe(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	var req updateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	name := user.Name
	if req.Name != "" {
		name = req.Name
	}

	phone := user.Phone
	if req.Phone != "" {
		phone = sql.NullString{String: req.Phone, Valid: true}
	}

	locale := user.Locale
	if req.Locale != "" {
		locale = req.Locale
	}

	notifyEmail := user.NotifyEmail
	if req.NotifyEmail != nil {
		notifyEmail = *req.NotifyEmail
	}

	notifyWhatsapp := user.NotifyWhatsapp
	if req.NotifyWhatsapp != nil {
		notifyWhatsapp = *req.NotifyWhatsapp
	}

	notifyPush := user.NotifyPush
	if req.NotifyPush != nil {
		notifyPush = *req.NotifyPush
	}

	updated, err := h.userService.Update(r.Context(), repository.UpdateUserParams{
		ID:             user.ID,
		Name:           name,
		Phone:          phone,
		Locale:         locale,
		NotifyEmail:    notifyEmail,
		NotifyWhatsapp: notifyWhatsapp,
		NotifyPush:     notifyPush,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, toUserResponse(updated))
}

type updateFCMTokenRequest struct {
	FCMToken string `json:"fcm_token"`
}

func (h *AuthHandler) UpdateFCMToken(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		writeError(w, http.StatusUnauthorized, "user not found")
		return
	}

	var req updateFCMTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.FCMToken == "" {
		writeError(w, http.StatusBadRequest, "fcm_token is required")
		return
	}

	if err := h.userService.UpdateFCMToken(r.Context(), user.ID, req.FCMToken); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "updated"})
}

func toUserResponse(u repository.User) UserResponse {
	return UserResponse{
		ID:             u.ID,
		TenantID:       u.TenantID,
		Email:          u.Email,
		Name:           u.Name,
		Phone:          nullStringPtr(u.Phone),
		Role:           u.Role,
		Locale:         u.Locale,
		NotifyEmail:    u.NotifyEmail,
		NotifyWhatsapp: u.NotifyWhatsapp,
		NotifyPush:     u.NotifyPush,
		CreatedAt:      u.CreatedAt,
		UpdatedAt:      u.UpdatedAt,
	}
}
