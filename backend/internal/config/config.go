package config

import (
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

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	smtpPort, _ := strconv.Atoi(os.Getenv("SMTP_PORT"))

	return &Config{
		DatabaseURL:                os.Getenv("DATABASE_URL"),
		FirebaseServiceAccountJSON: os.Getenv("FIREBASE_SERVICE_ACCOUNT_JSON"),
		WhatsAppAccessToken:        os.Getenv("WHATSAPP_ACCESS_TOKEN"),
		WhatsAppPhoneNumberID:      os.Getenv("WHATSAPP_PHONE_NUMBER_ID"),
		SMTPAddress:                os.Getenv("SMTP_ADDRESS"),
		SMTPPort:                   smtpPort,
		SMTPUsername:               os.Getenv("SMTP_USERNAME"),
		SMTPPassword:               os.Getenv("SMTP_PASSWORD"),
		SMTPDomain:                 os.Getenv("SMTP_DOMAIN"),
		Port:                       port,
	}
}
