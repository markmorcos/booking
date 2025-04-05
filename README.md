# Fr. Youhanna Makin - Appointment Booking System

## Project Overview

The Fr. Youhanna Makin application is a comprehensive appointment booking system designed to facilitate scheduling meetings with Fr. Youhanna Makin. The application consists of:

- A **public booking site** built with React (integrated via vite_rails) where users can book appointments by submitting their name and email.
- An **admin dashboard** (protected by Devise authentication) for managing availability slots and viewing booking events. The admin interface is served on a subdomain: **admin.fr-youhanna-makin.com**.
- API endpoints for a **React Native mobile app** (built with TypeScript) to fetch slots, create bookings, and manage events.

## System Requirements

- Ruby 3.3.0+
- Rails 8.0.2+
- Node.js 18+
- PostgreSQL 14+
- Yarn or npm

## Getting Started

### Initial Setup

1. Clone the repository:

   ```
   git clone https://github.com/your-username/fr-youhanna-makin.git
   cd fr-youhanna-makin
   ```

2. Install the required dependencies:

   ```
   bundle install
   yarn install
   ```

3. Set up the database:

   ```
   rails db:create db:migrate db:seed
   ```

4. Start the development server:

   ```
   ./bin/dev
   ```

5. Visit http://localhost:3000 to view the application.

   For the admin interface, visit http://admin.localhost:3000 (you'll need to configure your hosts file for local development).

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgres://user:password@localhost/fr_youhanna_makin_development
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=password
```

## Architecture

### Application Structure

- `app/models`: Domain models (Appointment, AvailabilitySlot, User)
- `app/controllers`: Controllers for both web and API endpoints
- `app/frontend`: React components for the public booking site and admin dashboard
- `app/views`: Layout files and minimal server-rendered views
- `mobile`: React Native mobile application
- `config`: Application configuration files
- `db`: Database migrations and seeds
- `docs`: Additional documentation
- `spec`: RSpec tests for the application

### Frontend Structure

The frontend is built with React and TypeScript, integrated via vite_rails:

- `app/frontend/entrypoints`: Entry points for Vite bundles
- `app/frontend/components`: Reusable React components
- `app/frontend/styles`: CSS and styling files
- `app/frontend/types`: TypeScript type definitions

## API Documentation

The API endpoints are available for the React Native mobile app:

- `GET /api/v1/availability_slots`: Fetch available slots
- `POST /api/v1/appointments`: Create a new appointment
- `GET /api/v1/appointments`: List appointments (requires authentication)
- `PATCH /api/v1/appointments/:id`: Update appointment status (requires authentication)

See the `/docs/api.md` file for detailed API documentation.

## Testing

Run the test suite with:

```
bundle exec rspec
```

For frontend tests:

```
yarn test
```

## Deployment

This application is configured to deploy with Kamal:

```
kamal setup
kamal deploy
```

## License

This project is proprietary and confidential. All rights reserved.
