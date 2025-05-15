import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Use different API URL depending on platform
// For iOS simulator, use localhost
// For Android emulator, use 10.0.2.2 (Android's special IP for host loopback)
// Otherwise use a configurable URL or fallback to the device's localhost
const getApiUrl = () => {
  const configuredUrl = Constants.expoConfig?.extra?.apiUrl;
  if (configuredUrl) return configuredUrl;

  // get current ip
  if (__DEV__) {
    return "http://192.168.1.32:3000/api";
  }

  return "https://booking.morcos.tech/api";
};

const API_URL = getApiUrl();
export interface AvailabilitySlot {
  id: string;
  startsAt: string;
  endsAt: string;
  available: boolean;
  durationMinutes: number;
  future: boolean;
  appointment: {
    id: number;
    bookingName: string;
    bookingEmail: string;
    bookingPhone?: string;
    status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  } | null;
}

export interface AvailabilitySlotPayload {
  id: string;
  type: "availabilitySlots";
  attributes: {
    startsAt: string;
    endsAt: string;
    durationMinutes: number;
    available: boolean;
    future: boolean;
  };
  relationships: {
    appointment: {
      data: object | null;
    };
  };
}

export interface Appointment {
  id: number;
  bookingName: string;
  bookingEmail: string;
  bookingPhone?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  availabilitySlotId: number;
  availabilitySlot: AvailabilitySlot;
}

export interface AppointmentPayload {
  id: string;
  type: "appointments";
  attributes: {
    bookingName: string;
    bookingEmail: string;
    bookingPhone?: string;
    status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
    createdAt: string;
    updatedAt: string;
    availabilitySlot: AvailabilitySlotPayload["attributes"];
  };
  relationships: {
    availabilitySlot: {
      data: {
        id: number;
        type: "availabilitySlots";
      };
    };
  };
}

export interface BookingFormData {
  bookingName: string;
  bookingEmail: string;
  bookingPhone?: string;
  availabilitySlotId: number;
}

export const getAvailableSlots = async (): Promise<AvailabilitySlot[]> => {
  try {
    const response = await fetch(`${API_URL}/availability_slots`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server responded with ${response.status}: ${errorText}`);
      throw new Error(
        `Failed to fetch availability slots (${response.status})`
      );
    }

    const { data } = await response.json();

    const slots = data.map((slot: AvailabilitySlotPayload) => ({
      id: slot.id,
      startsAt: slot.attributes.startsAt,
      endsAt: slot.attributes.endsAt,
      available: slot.attributes.available,
      durationMinutes: slot.attributes.durationMinutes,
      future: slot.attributes.future,
      appointment: slot.relationships.appointment.data,
    }));

    return slots;
  } catch (error) {
    console.error("Error fetching availability slots:", error);
    throw error;
  }
};

export const getAvailableSlotsForMonth = async (
  month: string
): Promise<AvailabilitySlot[]> => {
  try {
    const response = await fetch(
      `${API_URL}/availability_slots?month=${month}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server responded with ${response.status}: ${errorText}`);
      throw new Error(
        `Failed to fetch availability slots (${response.status})`
      );
    }

    const { data } = await response.json();

    const slots = data.map((slot: AvailabilitySlotPayload) => ({
      id: slot.id,
      startsAt: slot.attributes.startsAt,
      endsAt: slot.attributes.endsAt,
      available: slot.attributes.available,
      durationMinutes: slot.attributes.durationMinutes,
      future: slot.attributes.future,
      appointment: slot.relationships.appointment.data,
    }));

    return slots;
  } catch (error) {
    console.error("Error fetching availability slots:", error);
    throw error;
  }
};

export const createAppointment = async (
  data: BookingFormData
): Promise<Appointment> => {
  try {
    const response = await fetch(`${API_URL}/appointments`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking_name: data.bookingName,
        booking_email: data.bookingEmail,
        booking_phone: data.bookingPhone,
        availability_slot_id: data.availabilitySlotId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server responded with ${response.status}: ${errorText}`);
      throw new Error(`Failed to create appointment (${response.status})`);
    }

    const appointment = await response.json();

    await AsyncStorage.setItem("userEmail", data.bookingEmail);

    return appointment;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
};

export const getUserAppointments = async (): Promise<Appointment[]> => {
  try {
    const userEmail = await AsyncStorage.getItem("userEmail");
    if (!userEmail) return [];

    const response = await fetch(
      `${API_URL}/appointments?email=${encodeURIComponent(userEmail)}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server responded with ${response.status}: ${errorText}`);
      throw new Error(`Failed to fetch appointments (${response.status})`);
    }

    const { data, included } = await response.json();

    const appointments = data.map((appointment: AppointmentPayload) => ({
      id: appointment.id,
      bookingName: appointment.attributes.bookingName,
      bookingEmail: appointment.attributes.bookingEmail,
      bookingPhone: appointment.attributes.bookingPhone,
      status: appointment.attributes.status,
      availabilitySlot: appointment.attributes.availabilitySlot,
    }));

    return appointments;
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    // Return empty array instead of throwing to avoid crashes in the UI
    return [];
  }
};

export const cancelAppointment = async (
  appointmentId: number
): Promise<Appointment> => {
  try {
    const response = await fetch(
      `${API_URL}/appointments/${appointmentId}/cancel`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server responded with ${response.status}: ${errorText}`);
      throw new Error(`Failed to cancel appointment (${response.status})`);
    }

    const appointment = await response.json();
    return appointment;
  } catch (error) {
    console.error("Error canceling appointment:", error);
    throw error;
  }
};
