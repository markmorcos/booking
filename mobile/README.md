# Fr. Youhanna Makin - Mobile App

This is the React Native mobile application for the Fr. Youhanna Makin appointment booking system.

## Features

- View available appointment slots
- Book appointments
- Manage existing bookings
- Receive notifications for appointment confirmations and updates

## Requirements

- Node.js 16+
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

## Getting Started

### Installation

1. Install dependencies:

```bash
cd mobile
npm install
```

2. iOS specific setup:

```bash
cd ios
pod install
cd ..
```

### Running the App

To start the Metro bundler:

```bash
npm start
```

To run on iOS:

```bash
npm run ios
```

To run on Android:

```bash
npm run android
```

## Project Structure

```
mobile/
├── __tests__/         # Test files
├── android/           # Android project files
├── ios/               # iOS project files
├── src/               # Source code
│   ├── api/           # API service layer
│   ├── assets/        # Static assets
│   ├── components/    # Reusable components
│   ├── hooks/         # Custom React hooks
│   ├── navigation/    # Navigation configuration
│   ├── screens/       # Screen components
│   ├── services/      # Business logic services
│   ├── stores/        # State management
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── App.tsx        # Root component
├── .eslintrc.js       # ESLint configuration
├── .prettierrc.js     # Prettier configuration
├── package.json       # Node.js dependencies
└── tsconfig.json      # TypeScript configuration
```

## API Integration

The mobile app connects to the Fr. Youhanna Makin Rails API. See the API documentation in `/docs/api.md` for details.

## Testing

To run tests:

```bash
npm test
```

## Building for Production

### Android

```bash
cd android
./gradlew assembleRelease
```

### iOS

Build the app using Xcode's standard build process. 