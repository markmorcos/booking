import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import BookAppointmentScreen from "../../src/screens/BookAppointmentScreen";
import {
  availabilitySlotService,
  appointmentService,
} from "../../src/api/services";
import { format, parseISO } from "date-fns";

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

// Mock route
const mockRoute = {
  params: {
    slotId: 123,
  },
};

// Mock the API services
jest.mock("../../src/api/services", () => ({
  availabilitySlotService: {
    getSlots: jest.fn(),
  },
  appointmentService: {
    createAppointment: jest.fn(),
  },
}));

// Mock date-fns
jest.mock("date-fns", () => {
  const actual = jest.requireActual("date-fns");
  return {
    ...actual,
    format: jest.fn().mockReturnValue("October 15, 2023 at 9:00 AM - 10:00 AM"),
    parseISO: jest.fn().mockImplementation((str) => new Date(str)),
  };
});

describe("BookAppointmentScreen", () => {
  const mockSlot = {
    id: 123,
    start_time: "2023-10-15T09:00:00Z",
    end_time: "2023-10-15T10:00:00Z",
    booked: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock API responses
    (availabilitySlotService.getSlots as jest.Mock).mockResolvedValue([
      mockSlot,
    ]);
    (appointmentService.createAppointment as jest.Mock).mockResolvedValue({
      id: 456,
      status: "pending",
      name: "Test User",
      email: "test@example.com",
      phone: "123-456-7890",
      notes: "Test notes",
      slot: mockSlot,
    });
  });

  it("renders loading state initially", () => {
    const { getByText } = render(
      <BookAppointmentScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByText(/loading/i)).toBeTruthy();
  });

  it("fetches and displays slot information", async () => {
    const { getByText, queryByText } = render(
      <BookAppointmentScreen navigation={mockNavigation} route={mockRoute} />
    );

    await waitFor(() => {
      expect(queryByText(/loading/i)).toBeNull();
    });

    expect(getByText(/book your appointment/i)).toBeTruthy();
    expect(getByText(/october 15, 2023 at 9:00 AM - 10:00 AM/i)).toBeTruthy();
  });

  it("shows validation errors for empty fields", async () => {
    const { getByText, getByTestId, queryByText } = render(
      <BookAppointmentScreen navigation={mockNavigation} route={mockRoute} />
    );

    await waitFor(() => {
      expect(queryByText(/loading/i)).toBeNull();
    });

    // Submit without filling fields
    const submitButton = getByText(/book appointment/i);
    fireEvent.press(submitButton);

    // Check for validation errors
    expect(getByText(/name is required/i)).toBeTruthy();
    expect(getByText(/email is required/i)).toBeTruthy();
    expect(getByText(/phone number is required/i)).toBeTruthy();
  });

  it("submits the form and navigates on success", async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(
      <BookAppointmentScreen navigation={mockNavigation} route={mockRoute} />
    );

    await waitFor(() => {
      expect(queryByText(/loading/i)).toBeNull();
    });

    // Fill in form fields
    fireEvent.changeText(getByPlaceholderText(/name/i), "Test User");
    fireEvent.changeText(getByPlaceholderText(/email/i), "test@example.com");
    fireEvent.changeText(getByPlaceholderText(/phone/i), "123-456-7890");
    fireEvent.changeText(getByPlaceholderText(/notes/i), "Test notes");

    // Submit the form
    const submitButton = getByText(/book appointment/i);
    fireEvent.press(submitButton);

    await waitFor(() => {
      // Check if the API was called with correct data
      expect(appointmentService.createAppointment).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        phone: "123-456-7890",
        notes: "Test notes",
        availability_slot_id: 123,
      });

      // Check if navigation was called with correct params
      expect(mockNavigation.navigate).toHaveBeenCalledWith(
        "AppointmentConfirmation",
        {
          appointmentId: 456,
        }
      );
    });
  });

  it("displays error message on API failure", async () => {
    // Mock API error
    (appointmentService.createAppointment as jest.Mock).mockRejectedValueOnce({
      message: "Network error",
      response: {
        data: {
          errors: {
            email: ["is invalid"],
          },
        },
      },
    });

    const { getByText, getByPlaceholderText, queryByText } = render(
      <BookAppointmentScreen navigation={mockNavigation} route={mockRoute} />
    );

    await waitFor(() => {
      expect(queryByText(/loading/i)).toBeNull();
    });

    // Fill in form fields
    fireEvent.changeText(getByPlaceholderText(/name/i), "Test User");
    fireEvent.changeText(getByPlaceholderText(/email/i), "invalid-email");
    fireEvent.changeText(getByPlaceholderText(/phone/i), "123-456-7890");

    // Submit the form
    const submitButton = getByText(/book appointment/i);
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText(/email is invalid/i)).toBeTruthy();
    });
  });
});
