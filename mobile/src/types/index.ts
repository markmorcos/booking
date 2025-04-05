// Availability Slot
export interface AvailabilitySlot {
  id: number;
  start_time: string;
  end_time: string;
  booked: boolean;
}

// Appointment
export interface Appointment {
  id: number;
  status: 'pending' | 'confirmed' | 'cancelled';
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

// Authentication
export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// API responses
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

// Form submission
export interface AppointmentFormData {
  name: string;
  email: string;
  phone: string;
  notes?: string;
  availability_slot_id: number;
}

// Navigation
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  AvailableSlots: undefined;
  SlotDetails: { slotId: number };
  BookAppointment: { slotId: number };
  AppointmentConfirmation: { appointmentId: number };
  MyAppointments: undefined;
  AppointmentDetails: { appointmentId: number };
  Profile: undefined;
  Settings: undefined;
}; 