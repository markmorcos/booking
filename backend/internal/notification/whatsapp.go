package notification

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/markmorcos/booking/backend/internal/config"
	"github.com/markmorcos/booking/backend/internal/i18n"
	"github.com/markmorcos/booking/backend/internal/repository"
)

type WhatsAppSender struct {
	cfg *config.Config
}

func NewWhatsAppSender(cfg *config.Config) *WhatsAppSender {
	return &WhatsAppSender{cfg: cfg}
}

type whatsappMessage struct {
	MessagingProduct string               `json:"messaging_product"`
	To               string               `json:"to"`
	Type             string               `json:"type"`
	Template         *whatsappTemplate     `json:"template,omitempty"`
	Text             *whatsappText         `json:"text,omitempty"`
}

type whatsappTemplate struct {
	Name       string                    `json:"name"`
	Language   whatsappLanguage          `json:"language"`
	Components []whatsappComponent       `json:"components,omitempty"`
}

type whatsappLanguage struct {
	Code string `json:"code"`
}

type whatsappComponent struct {
	Type       string              `json:"type"`
	Parameters []whatsappParameter `json:"parameters,omitempty"`
}

type whatsappParameter struct {
	Type string `json:"type"`
	Text string `json:"text,omitempty"`
}

type whatsappText struct {
	Body string `json:"body"`
}

func (w *WhatsAppSender) Send(ctx context.Context, eventType string, user repository.User) error {
	if w.cfg.WhatsAppAccessToken == "" || w.cfg.WhatsAppPhoneNumberID == "" {
		return fmt.Errorf("WhatsApp not configured")
	}

	if !user.Phone.Valid || user.Phone.String == "" {
		return fmt.Errorf("user has no phone number")
	}

	message := i18n.T(eventType, user.Locale)

	msg := whatsappMessage{
		MessagingProduct: "whatsapp",
		To:               user.Phone.String,
		Type:             "text",
		Text:             &whatsappText{Body: message},
	}

	body, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	url := fmt.Sprintf("https://graph.facebook.com/v22.0/%s/messages", w.cfg.WhatsAppPhoneNumberID)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+w.cfg.WhatsAppAccessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send WhatsApp message: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("WhatsApp API error (status %d): %s", resp.StatusCode, string(respBody))
	}

	return nil
}
