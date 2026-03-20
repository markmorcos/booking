# Ma3ady

Multi-tenant appointment booking system with Go backend and React Native (Expo) mobile app.

**Domain**: ma3ady.com

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

## Building for Stores

```bash
cd mobile
eas build --platform android --profile production
eas build --platform ios --profile production
eas submit --platform android
eas submit --platform ios
```

Store assets are in `mobile/assets/store/`.

## Deployment

Push to `main` triggers deployment via GitHub Actions to Kubernetes.

## K8s Secrets Required

- `database-secret`: DATABASE_URL
- `firebase-secret`: FIREBASE_SERVICE_ACCOUNT_JSON
- `whatsapp-secret`: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID
- `smtp-secrets`: SMTP_ADDRESS, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_DOMAIN
- `cors`: CORS_ALLOWED_ORIGINS (default: `https://ma3ady.com,https://www.ma3ady.com`)
