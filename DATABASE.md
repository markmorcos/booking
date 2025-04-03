# Database Schema

## Tables

### availability_slots

Stores all available time slots for appointments.

| Column     | Type      | Description                       |
| ---------- | --------- | --------------------------------- |
| id         | SERIAL    | Primary key                       |
| date       | DATE      | The date of the availability slot |
| start_time | TIME      | Start time of the slot            |
| end_time   | TIME      | End time of the slot              |
| duration   | INTEGER   | Duration of the slot in minutes   |
| is_booked  | BOOLEAN   | Whether the slot has been booked  |
| created_at | TIMESTAMP | When the record was created       |
| updated_at | TIMESTAMP | When the record was last updated  |

### appointment_requests

Stores appointment booking requests.

| Column     | Type      | Description                                        |
| ---------- | --------- | -------------------------------------------------- |
| id         | SERIAL    | Primary key                                        |
| slot_id    | INTEGER   | Foreign key to availability_slots                  |
| name       | TEXT      | Name of the person booking the appointment         |
| email      | TEXT      | Email of the person booking the appointment        |
| status     | TEXT      | Status of the request (pending/confirmed/rejected) |
| created_at | TIMESTAMP | When the record was created                        |
| updated_at | TIMESTAMP | When the record was last updated                   |

## Row Level Security Policies

The database uses Row Level Security (RLS) to control access to data:

- Anonymous users can:

  - View availability slots
  - Create appointment requests

- Authenticated users (admins) can:
  - View, create, update, and delete availability slots
  - View, update, and delete appointment requests

## Indexes

The following indexes improve query performance:

- `idx_slots_date_time`: For querying slots by date and time
- `idx_slots_is_booked`: For filtering available/booked slots
- `idx_appointment_status`: For filtering appointment requests by status
