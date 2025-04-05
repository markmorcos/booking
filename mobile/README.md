# Fr. Youhanna Makin - Mobile App

This is the React Native mobile application for the Fr. Youhanna Makin appointment booking system.

## Features

- View available appointment slots
- Book appointments with Fr. Youhanna Makin
- Receive confirmations for appointment bookings
- Admin functionality:
  - Manage appointments (confirm, cancel)
  - View all appointment requests
  - Manage user profile and settings

## Screenshots

(Screenshots would be included here in a real application)

## Requirements

- Node.js 16+
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

## Getting Started

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/fr-youhanna-makin.git
cd fr-youhanna-makin/mobile
```

2. Install dependencies:

```bash
npm install
```

3. iOS specific setup:

```bash
cd ios
pod install
cd ..
```

### Configuration

1. Create a `.env` file in the root of the mobile directory with the following variables:

```
API_URL=https://fr-youhanna-makin.com/api/v1
```

2. For development, you may want to point to your local API:

```
API_URL=http://localhost:3000/api/v1
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
├── assets/            # Static assets (images, fonts)
├── src/               # Source code
│   ├── api/           # API service layer
│   │   ├── client.ts  # API client configuration
│   │   └── services.ts # API service functions
│   ├── components/    # Reusable components
│   ├── hooks/         # Custom React hooks
│   ├── navigation/    # Navigation configuration
│   ├── screens/       # Screen components
│   │   ├── AvailableSlotsScreen.tsx
│   │   ├── SlotDetailsScreen.tsx
│   │   ├── BookAppointmentScreen.tsx
│   │   ├── AppointmentConfirmationScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── MyAppointmentsScreen.tsx
│   │   ├── AppointmentDetailsScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/      # Business logic services
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

The following endpoints are used:

- `GET /api/v1/availability_slots` - Get available slots
- `POST /api/v1/appointments` - Book an appointment
- `GET /api/v1/appointments` - List appointments (admin only)
- `GET /api/v1/appointments/:id` - Get appointment details (admin only)
- `PATCH /api/v1/appointments/:id` - Update appointment status (admin only)
- `POST /api/v1/auth/sign_in` - Login (admin only)

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

The generated APK will be available at `android/app/build/outputs/apk/release/app-release.apk`.

### iOS

Build the app using Xcode's standard build process:

1. Open `ios/FrYouhannaMakin.xcworkspace` in Xcode
2. Select the appropriate target device
3. Select Product > Archive

## Troubleshooting

### Common Issues

1. **Metro bundler fails to start**

   ```
   npm start -- --reset-cache
   ```

2. **iOS build fails with CocoaPods errors**

   ```
   cd ios
   pod deintegrate
   pod install
   ```

3. **Android build fails**
   - Check that the Android SDK is properly installed and configured
   - Make sure JAVA_HOME is set correctly

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## License

This project is proprietary and confidential. All rights reserved.
