# Appointment Booking System

A multi-tenant application for managing appointments and availability slots.

## Features

### Multi-tenant Support

- Each tenant has its own subdomain/path
- Isolated data and settings per tenant
- Customizable availability slots per tenant

### Appointment Management

- Create and manage appointments
- Track appointment status (pending, confirmed, cancelled, completed, no-show)
- Send email notifications for appointment status changes
- WhatsApp notifications for appointment reminders

### Availability Management

- Create individual availability slots
- Batch create availability slots
- Update slot durations in bulk
- Delete ranges of slots
- Prevent overlapping slots

### User Management

- Invitation-based user registration
- Role-based access control
- User status tracking (Active, Invitation Pending, Not Invited)
- Ability to resend invitations
- Email cannot be changed after user creation

## Setup

### Prerequisites

- Ruby 3.4.2
- PostgreSQL
- Node.js (for asset compilation)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd booking/backend
```

2. Install dependencies

```bash
bundle install
```

3. Set up the database

```bash
rails db:create db:migrate
```

4. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Start the server

```bash
rails server
```

### Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `SMTP_HOST`: SMTP server host
- `SMTP_PORT`: SMTP server port
- `SMTP_USERNAME`: SMTP username
- `SMTP_PASSWORD`: SMTP password
- `WHATSAPP_API_KEY`: WhatsApp API key
- `WHATSAPP_PHONE_NUMBER_ID`: WhatsApp phone number ID

## Development

### Running Tests

```bash
rails test
```

### Code Style

The project uses Rubocop for code style enforcement:

```bash
rubocop
```

### Database Migrations

```bash
rails db:migrate
```

## User Management

### Creating Users

1. Navigate to the Users section in the admin interface
2. Click "Add User"
3. Fill in the user's name, email, and phone number
4. The system will automatically send an invitation email

### User Statuses

- **Active**: User has accepted the invitation and set their password
- **Invitation Pending**: Invitation has been sent but not yet accepted
- **Not Invited**: User has been created but no invitation has been sent

### Managing Invitations

- Resend invitations to pending users
- Track invitation status
- Email addresses cannot be changed after user creation

## Deployment

The application is configured for deployment using Kamal:

```bash
kamal setup
kamal deploy
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
