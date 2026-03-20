export interface User {
  id: string;
  firebase_uid: string;
  tenant_id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin';
  locale: string;
  notify_email: boolean;
  notify_whatsapp: boolean;
  notify_push: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  default_locale: string;
}

export interface AvailabilitySlot {
  id: string;
  tenant_id: string;
  starts_at: string;
  ends_at: string;
  is_available: boolean;
}

export interface Appointment {
  id: string;
  tenant_id: string;
  user_id: string;
  availability_slot_id: string;
  status: AppointmentStatus;
  cancel_reason?: string;
  notes?: string;
  created_at: string;
  slot?: AvailabilitySlot;
  user?: User;
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export interface RecurrenceRule {
  id: string;
  tenant_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  effective_from: string;
  effective_until?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  from?: string;
  to?: string;
  user_id?: string;
}
