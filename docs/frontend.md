# Fr. Youhanna Makin Frontend Documentation

This document provides comprehensive information about the frontend implementation of the Fr. Youhanna Makin appointment booking system, including the web frontend using vite_rails and the React Native mobile app.

## Table of Contents

- [Web Frontend](#web-frontend)
  - [Overview](#overview)
  - [Technology Stack](#technology-stack)
  - [Project Structure](#project-structure)
  - [Key Components](#key-components)
  - [State Management](#state-management)
  - [API Integration](#api-integration)
  - [Testing](#web-testing)
- [Mobile App](#mobile-app)
  - [Overview](#mobile-overview)
  - [Technology Stack](#mobile-technology-stack)
  - [Project Structure](#mobile-project-structure)
  - [Key Screens](#key-screens)
  - [API Integration](#mobile-api-integration)
  - [Testing](#mobile-testing)
- [Development Guide](#development-guide)
  - [Setting Up the Development Environment](#setting-up-the-development-environment)
  - [Building and Running](#building-and-running)
  - [Common Issues](#common-issues)

## Web Frontend <a name="web-frontend"></a>

### Overview <a name="overview"></a>

The web frontend of the Fr. Youhanna Makin application consists of two main parts:

1. **Public Booking Site**: A public-facing interface that allows users to book appointments by selecting an available time slot and submitting their information.
2. **Admin Dashboard**: A protected interface that allows administrators to manage availability slots and view appointment bookings.

### Technology Stack <a name="technology-stack"></a>

- **React**: A JavaScript library for building user interfaces
- **TypeScript**: A typed superset of JavaScript
- **vite_rails**: Rails gem for integrating Vite with Rails
- **date-fns**: A date utility library
- **Jest & React Testing Library**: For unit and integration testing

### Project Structure <a name="project-structure"></a>

```
app/frontend/
├── components/            # Reusable React components
│   ├── BookingApp.tsx     # Main component for public booking
│   ├── BookingForm.tsx    # Form for entering appointment details
│   ├── SlotSelector.tsx   # Component for selecting time slots
│   ├── SuccessMessage.tsx # Shown after successful booking
│   └── admin/             # Admin dashboard components
├── entrypoints/           # Vite entry points
│   ├── application.tsx    # Public site entry point
│   └── admin.tsx          # Admin dashboard entry point
├── styles/                # CSS and style files
├── types/                 # TypeScript type definitions
│   └── index.ts           # Shared type definitions
└── __tests__/             # Unit tests
    └── components/        # Component tests
```

### Key Components <a name="key-components"></a>

#### BookingApp

The main component for the public booking site that manages the booking flow:

1. Display available slots
2. Collect user information
3. Submit booking request
4. Show success message

#### SlotSelector

Allows users to browse and select from available appointment slots:

- Navigate between weeks
- View slots in a formatted, user-friendly way
- Select a slot to proceed with booking

#### BookingForm

Collects required information from users:

- Name
- Email address
- Phone number
- Optional notes

#### Admin Dashboard Components

A set of components for the admin interface:

- View and manage availability slots
- View and update appointment statuses
- User management

### State Management <a name="state-management"></a>

The application uses React's built-in state management (useState, useEffect) for managing component state. For complex state management, the application follows a pattern of lifting state up to parent components.

### API Integration <a name="api-integration"></a>

The frontend communicates with the Rails backend through RESTful API endpoints:

- **GET /availability_slots.json**: Fetch available slots
- **POST /appointments**: Create a new appointment
- **GET /admin/dashboard.json**: Fetch dashboard statistics (admin only)
- **GET /admin/availability_slots.json**: Fetch all slots (admin only)
- **GET /admin/appointments.json**: Fetch all appointments (admin only)

API requests are made using the Fetch API with appropriate CSRF token handling.

### Testing <a name="web-testing"></a>

The web frontend includes unit tests using Jest and React Testing Library:

```bash
# Run frontend tests
yarn test
```

Tests cover key components, ensuring they render correctly, handle user interactions, and manage state as expected.

## Mobile App <a name="mobile-app"></a>

### Overview <a name="mobile-overview"></a>

The mobile app provides a portable interface for users to book appointments with Fr. Youhanna Makin. It includes screens for browsing available slots, viewing slot details, and submitting booking information.

### Technology Stack <a name="mobile-technology-stack"></a>

- **React Native**: A framework for building mobile applications
- **TypeScript**: A typed superset of JavaScript
- **React Navigation**: For screen navigation
- **React Native Paper**: UI component library
- **Axios**: HTTP client for API requests
- **date-fns**: Date utility library
- **Jest & React Native Testing Library**: For testing

### Project Structure <a name="mobile-project-structure"></a>

```
mobile/
├── android/               # Android native code
├── ios/                   # iOS native code
├── src/
│   ├── api/               # API client and services
│   │   ├── client.ts      # Axios client configuration
│   │   └── services.ts    # API service functions
│   ├── components/        # Reusable UI components
│   ├── screens/           # App screens
│   │   ├── AvailableSlotsScreen.tsx    # Browse available slots
│   │   ├── SlotDetailsScreen.tsx       # View slot details
│   │   ├── BookAppointmentScreen.tsx   # Book an appointment
│   │   └── ...
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   └── App.tsx            # Main app component
├── __tests__/             # Test files
│   └── screens/           # Screen tests
└── package.json           # Dependencies and scripts
```

### Key Screens <a name="key-screens"></a>

#### AvailableSlotsScreen

Displays available appointment slots with options to:

- Navigate between weeks
- Filter slots
- Select a slot to view details

#### SlotDetailsScreen

Shows detailed information about a selected slot:

- Date and time information
- Duration
- Option to proceed with booking

#### BookAppointmentScreen

Collects user information for booking:

- Name
- Email
- Phone number
- Additional notes

#### AppointmentConfirmationScreen

Displays confirmation details after successful booking.

### API Integration <a name="mobile-api-integration"></a>

The mobile app communicates with the backend through a dedicated API client built with Axios:

```typescript
// Example API service call
const slots = await availabilitySlotService.getSlots(startDate, endDate);
```

Key API services:

- `availabilitySlotService.getSlots`: Fetch available slots
- `appointmentService.createAppointment`: Create a new appointment
- `authService.login`: Authenticate admin users

### Testing <a name="mobile-testing"></a>

The mobile app includes unit tests using Jest and React Native Testing Library:

```bash
# Run mobile app tests
cd mobile
npm test
```

Tests cover key screens and functionality, ensuring they render correctly, handle user interactions, and manage state as expected.

## Development Guide <a name="development-guide"></a>

### Setting Up the Development Environment <a name="setting-up-the-development-environment"></a>

#### Web Frontend

1. Install dependencies:

   ```bash
   bundle install
   yarn install
   ```

2. Set up the database:

   ```bash
   rails db:create db:migrate db:seed
   ```

3. Start the development server:

   ```bash
   ./bin/dev
   ```

4. Visit http://localhost:3000 for the public site or http://admin.localhost:3000 for the admin dashboard.

#### Mobile App

1. Navigate to the mobile directory:

   ```bash
   cd mobile
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Metro bundler:

   ```bash
   npm start
   ```

4. Run on iOS or Android:
   ```bash
   npm run ios
   # or
   npm run android
   ```

### Building and Running <a name="building-and-running"></a>

#### Web Frontend

For production build:

```bash
RAILS_ENV=production bundle exec rake assets:precompile
```

#### Mobile App

For Android release build:

```bash
cd android && ./gradlew assembleRelease
```

For iOS release build:

```bash
cd ios && xcodebuild -workspace FrYouhannaApp.xcworkspace -scheme FrYouhannaApp -configuration Release
```

### Common Issues <a name="common-issues"></a>

1. **CORS Issues**: If experiencing CORS problems when the mobile app communicates with the backend, ensure the `cors.rb` initializer is properly configured.

2. **Authentication Errors**: For admin actions, ensure proper authentication headers are included in API requests.

3. **Date Formatting Issues**: The application uses date-fns for consistent date handling across platforms. Ensure date strings are properly formatted when sending/receiving from the API.
