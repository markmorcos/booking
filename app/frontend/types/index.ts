// app/frontend/types/index.ts

// Availability Slot type
export interface AvailabilitySlot {
  id: number;
  start_time: string;
  end_time: string;
  booked: boolean;
}

// Appointment type
export interface Appointment {
  id: number;
  status: "pending" | "confirmed" | "cancelled";
  name: string;
  email: string;
  phone: string;
  notes?: string;
  created_at: string;
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
