package notification

import (
	"bytes"
	"context"
	"fmt"
	"html/template"
	"net/smtp"
	"path/filepath"

	"github.com/markmorcos/booking/backend/internal/config"
	"github.com/markmorcos/booking/backend/internal/i18n"
	"github.com/markmorcos/booking/backend/internal/repository"
)

type EmailSender struct {
	cfg          *config.Config
	templatesDir string
}

func NewEmailSender(cfg *config.Config, templatesDir string) *EmailSender {
	return &EmailSender{cfg: cfg, templatesDir: templatesDir}
}

func (e *EmailSender) Send(ctx context.Context, eventType string, user repository.User) error {
	subject := i18n.T(eventType, user.Locale)
	body, err := e.renderTemplate(eventType, user.Locale, map[string]string{
		"Name":    user.Name,
		"Subject": subject,
	})
	if err != nil {
		return fmt.Errorf("failed to render template: %w", err)
	}

	return e.sendEmail(user.Email, subject, body)
}

func (e *EmailSender) SendInvite(ctx context.Context, email, name string) error {
	subject := i18n.T("invite_subject", "en")
	body, err := e.renderTemplate("invite", "en", map[string]string{
		"Name":    name,
		"Subject": subject,
	})
	if err != nil {
		return fmt.Errorf("failed to render template: %w", err)
	}

	return e.sendEmail(email, subject, body)
}

func (e *EmailSender) renderTemplate(eventType, locale string, data map[string]string) (string, error) {
	// Try locale-specific template first, fall back to English
	tmplFile := filepath.Join(e.templatesDir, fmt.Sprintf("%s_%s.html", eventType, locale))
	tmpl, err := template.ParseFiles(tmplFile)
	if err != nil {
		tmplFile = filepath.Join(e.templatesDir, fmt.Sprintf("%s_en.html", eventType))
		tmpl, err = template.ParseFiles(tmplFile)
		if err != nil {
			// Use inline fallback template
			tmpl = template.Must(template.New("fallback").Parse(
				`<!DOCTYPE html><html><body><h1>{{.Subject}}</h1><p>Dear {{.Name}},</p><p>{{.Subject}}</p></body></html>`))
		}
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}
	return buf.String(), nil
}

func (e *EmailSender) sendEmail(to, subject, body string) error {
	if e.cfg.SMTPAddress == "" {
		return fmt.Errorf("SMTP not configured")
	}

	from := e.cfg.SMTPUsername
	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s",
		from, to, subject, body)

	addr := fmt.Sprintf("%s:%d", e.cfg.SMTPAddress, e.cfg.SMTPPort)
	var auth smtp.Auth
	if e.cfg.SMTPUsername != "" {
		auth = smtp.PlainAuth("", e.cfg.SMTPUsername, e.cfg.SMTPPassword, e.cfg.SMTPAddress)
	}

	return smtp.SendMail(addr, auth, from, []string{to}, []byte(msg))
}
