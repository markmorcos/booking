# Booking App

Multi-tenant appointment booking system with Go backend and React Native (Expo) mobile app.

## Backend (Go)

```bash
cd backend
cp ../.env.example .env  # configure your env vars
go run ./cmd/server      # starts on :8080
go run ./cmd/server -migrate  # run DB migrations
```

## Mobile (Expo)

```bash
cd mobile
npm install
npx expo start
```

## Deployment

Push to `main` triggers deployment via GitHub Actions to Kubernetes.

## K8s Secrets Required

- `database-secret`: DATABASE_URL
- `firebase-secret`: FIREBASE_SERVICE_ACCOUNT_JSON
- `whatsapp-secret`: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID
- `smtp-secrets`: SMTP_ADDRESS, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_DOMAIN
