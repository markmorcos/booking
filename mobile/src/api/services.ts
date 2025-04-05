import client from './client';
import {
  AvailabilitySlot,
  Appointment,
  AppointmentFormData,
  AuthResponse,
  LoginCredentials,
  PaginatedResponse,
} from '../types';
import { format } from 'date-fns';

// Authentication services
export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await client.post<AuthResponse>('/auth/sign_in', { user: credentials });
    return response.data;
  },
};

// Availability slot services
export const availabilitySlotService = {
  // Get all available slots (optionally filtered by date range)
  getSlots: async (startDate?: Date, endDate?: Date): Promise<AvailabilitySlot[]> => {
    let url = '/availability_slots';
    const params: Record<string, string> = {};
    
    if (startDate) {
      params.start_date = format(startDate, 'yyyy-MM-dd');
    }
    
    if (endDate) {
      params.end_date = format(endDate, 'yyyy-MM-dd');
    }
    
    const response = await client.get<{ availability_slots: AvailabilitySlot[] }>(url, { params });
    return response.data.availability_slots;
  },
  
  // Admin: Create a new availability slot
  createSlot: async (startTime: Date, endTime: Date): Promise<AvailabilitySlot> => {
    const data = {
      availability_slot: {
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      },
    };
    
    const response = await client.post<AvailabilitySlot>('/availability_slots', data);
    return response.data;
  },
  
  // Admin: Delete an availability slot
  deleteSlot: async (id: number): Promise<void> => {
    await client.delete(`/availability_slots/${id}`);
  },
};

// Appointment services
export const appointmentService = {
  // Create a new appointment
  createAppointment: async (formData: AppointmentFormData): Promise<Appointment> => {
    const response = await client.post<Appointment>('/appointments', { appointment: formData });
    return response.data;
  },
  
  // Admin: Get all appointments (with optional filters)
  getAppointments: async (
    page: number = 1,
    status?: 'pending' | 'confirmed' | 'cancelled',
    startDate?: Date,
    endDate?: Date
  ): Promise<PaginatedResponse<Appointment>> => {
    const params: Record<string, string | number> = { page };
    
    if (status) {
      params.status = status;
    }
    
    if (startDate) {
      params.start_date = format(startDate, 'yyyy-MM-dd');
    }
    
    if (endDate) {
      params.end_date = format(endDate, 'yyyy-MM-dd');
    }
    
    const response = await client.get<PaginatedResponse<Appointment>>('/appointments', { params });
    return response.data;
  },
  
  // Admin: Get appointment details
  getAppointment: async (id: number): Promise<Appointment> => {
    const response = await client.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },
  
  // Admin: Update appointment status
  updateAppointmentStatus: async (id: number, status: 'pending' | 'confirmed' | 'cancelled'): Promise<Appointment> => {
    const response = await client.patch<Appointment>(`/appointments/${id}`, {
      appointment: { status },
    });
    return response.data;
  },
}; 