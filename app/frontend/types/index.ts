// app/frontend/types/index.ts

// Availability Slot type
export interface AvailabilitySlot {
  id: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  appointment_id: number | null;
}

// Appointment type
export interface Appointment {
  id: number;
  name: string;
  email: string;
  phone: string;
  notes: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  updated_at: string;
  slot: {
    id: number;
    start_time: string;
    end_time: string;
  };
}

// Form submission type for creating an appointment
export interface AppointmentFormData {
  name: string;
  email: string;
  phone: string;
  notes?: string;
  availability_slot_id: number;
}

// Admin User type
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
  sign_in_count: number;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    total_pages: number;
    total_count: number;
  };
}
