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

  if (__DEV__) {
    // Development environment
    if (Platform.OS === "ios") {
      return "http://localhost:3000/api";
    } else if (Platform.OS === "android") {
      return "http://192.168.1.6:3000/api";
    }
  }

  return "http://127.0.0.1:3000/api";
};

const API_URL = getApiUrl();
console.log(`Using API URL: ${API_URL}`);

// Types based on Rails models
export interface AvailabilitySlot {
  id: number;
  starts_at: string;
  ends_at: string;
  available: boolean;
}

export interface Appointment {
  id: number;
  booking_name: string;
  booking_email: string;
  booking_phone?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  availability_slot_id: number;
  availability_slot: {
    starts_at: string;
    ends_at: string;
  };
}

export interface BookingFormData {
  booking_name: string;
  booking_email: string;
  booking_phone?: string;
  availability_slot_id: number;
}

export const getAvailableSlots = async (): Promise<AvailabilitySlot[]> => {
  try {
    console.log(
      `Fetching availability slots from ${API_URL}/availability_slots`
    );
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

    return response.json();
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
      body: JSON.stringify({ appointment: data }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server responded with ${response.status}: ${errorText}`);
      throw new Error(`Failed to create appointment (${response.status})`);
    }

    const appointment = await response.json();

    await AsyncStorage.setItem("userEmail", data.booking_email);

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

    return response.json();
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    // Return empty array instead of throwing to avoid crashes in the UI
    return [];
  }
};
