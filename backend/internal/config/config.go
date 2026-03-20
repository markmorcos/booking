package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	DatabaseURL                string
	FirebaseServiceAccountJSON string
	WhatsAppAccessToken        string
	WhatsAppPhoneNumberID      string
	SMTPAddress                string
	SMTPPort                   int
	SMTPUsername               string
	SMTPPassword               string
	SMTPDomain                 string
	Port                       string
}

func Load() (*Config, error) {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable is required")
	}

	smtpPort := 587
	if sp := os.Getenv("SMTP_PORT"); sp != "" {
		var err error
		smtpPort, err = strconv.Atoi(sp)
		if err != nil {
			return nil, fmt.Errorf("invalid SMTP_PORT: %w", err)
		}
	}

	return &Config{
		DatabaseURL:                dbURL,
		FirebaseServiceAccountJSON: os.Getenv("FIREBASE_SERVICE_ACCOUNT_JSON"),
		WhatsAppAccessToken:        os.Getenv("WHATSAPP_ACCESS_TOKEN"),
		WhatsAppPhoneNumberID:      os.Getenv("WHATSAPP_PHONE_NUMBER_ID"),
		SMTPAddress:                os.Getenv("SMTP_ADDRESS"),
		SMTPPort:                   smtpPort,
		SMTPUsername:               os.Getenv("SMTP_USERNAME"),
		SMTPPassword:               os.Getenv("SMTP_PASSWORD"),
		SMTPDomain:                 os.Getenv("SMTP_DOMAIN"),
		Port:                       port,
	}, nil
}
