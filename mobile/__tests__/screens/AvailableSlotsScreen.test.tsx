import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AvailableSlotsScreen from "../../src/screens/AvailableSlotsScreen";
import { availabilitySlotService } from "../../src/api/services";
import { format, startOfWeek, endOfWeek, addWeeks } from "date-fns";

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

// Mock the API service
jest.mock("../../src/api/services", () => ({
  availabilitySlotService: {
    getSlots: jest.fn(),
  },
}));

// Mock date-fns to control date handling
jest.mock("date-fns", () => {
  const actual = jest.requireActual("date-fns");
  return {
    ...actual,
    startOfWeek: jest.fn(),
    endOfWeek: jest.fn(),
    addWeeks: jest.fn(),
    parseISO: jest.fn((str) => new Date(str)),
    format: jest.fn(),
  };
});

describe("AvailableSlotsScreen", () => {
  const mockSlots = [
    {
      id: 1,
      start_time: "2023-10-15T09:00:00Z",
      end_time: "2023-10-15T10:00:00Z",
      booked: false,
    },
    {
      id: 2,
      start_time: "2023-10-15T11:00:00Z",
      end_time: "2023-10-15T12:00:00Z",
      booked: false,
    },
  ];

  const mockStartDate = new Date("2023-10-15T00:00:00Z");
  const mockEndDate = new Date("2023-10-21T23:59:59Z");

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock date-fns functions
    (startOfWeek as jest.Mock).mockReturnValue(mockStartDate);
    (endOfWeek as jest.Mock).mockReturnValue(mockEndDate);
    (addWeeks as jest.Mock).mockImplementation((date, weeks) => {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + weeks * 7);
      return newDate;
    });
    (format as jest.Mock).mockImplementation((date, formatStr) => {
      if (formatStr.includes("MMM d")) {
        return "Oct 15";
      }
      if (formatStr.includes("EEEE, MMMM d, yyyy")) {
        return "Sunday, October 15, 2023";
      }
      if (formatStr.includes("h:mm a")) {
        return "9:00 AM";
      }
      return "formatted-date";
    });

    // Mock API response
    (availabilitySlotService.getSlots as jest.Mock).mockResolvedValue(
      mockSlots
    );
  });

  it("renders loading state initially", () => {
    const { getByText } = render(
      <AvailableSlotsScreen navigation={mockNavigation} route={{} as any} />
    );
    expect(getByText("Loading available slots...")).toBeTruthy();
  });

  it("fetches and displays slots", async () => {
    const { getByText, queryByText } = render(
      <AvailableSlotsScreen navigation={mockNavigation} route={{} as any} />
    );

    // Should start with loading
    expect(getByText("Loading available slots...")).toBeTruthy();

    // Wait for loading to finish
    await waitFor(() => {
      expect(queryByText("Loading available slots...")).toBeNull();
    });

    // Check if API was called with correct dates
    expect(availabilitySlotService.getSlots).toHaveBeenCalledWith(
      mockStartDate,
      mockEndDate
    );

    // Check if slots are displayed
    expect(getByText("Sunday, October 15, 2023")).toBeTruthy();
  });

  it("handles navigation to slot details", async () => {
    const { getAllByText, queryByText } = render(
      <AvailableSlotsScreen navigation={mockNavigation} route={{} as any} />
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(queryByText("Loading available slots...")).toBeNull();
    });

    // Find and tap on a slot
    const slotCard = getAllByText("Sunday, October 15, 2023")[0];
    fireEvent.press(slotCard);

    // Check if navigation was called with correct params
    expect(mockNavigation.navigate).toHaveBeenCalledWith("SlotDetails", {
      slotId: 1,
    });
  });

  it("handles week navigation", async () => {
    const { getByText, queryByText } = render(
      <AvailableSlotsScreen navigation={mockNavigation} route={{} as any} />
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(queryByText("Loading available slots...")).toBeNull();
    });

    // Reset mock to track next call
    (availabilitySlotService.getSlots as jest.Mock).mockClear();

    // Navigate to next week
    fireEvent.press(getByText("Next"));

    // Check if addWeeks was called with the correct params
    expect(addWeeks).toHaveBeenCalledWith(mockStartDate, 1);

    // Check if API was called again
    expect(availabilitySlotService.getSlots).toHaveBeenCalled();

    // Reset mock again
    (availabilitySlotService.getSlots as jest.Mock).mockClear();

    // Navigate to previous week
    fireEvent.press(getByText("Previous"));

    // Check if addWeeks was called with the correct params
    expect(addWeeks).toHaveBeenCalledWith(expect.anything(), -1);

    // Check if API was called again
    expect(availabilitySlotService.getSlots).toHaveBeenCalled();
  });

  it("displays error state on fetch failure", async () => {
    // Mock API error
    (availabilitySlotService.getSlots as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    const { getByText, queryByText } = render(
      <AvailableSlotsScreen navigation={mockNavigation} route={{} as any} />
    );

    // Wait for error state
    await waitFor(() => {
      expect(queryByText("Loading available slots...")).toBeNull();
      expect(
        getByText("Failed to load available slots. Please try again.")
      ).toBeTruthy();
    });

    // Reset mock to succeed on retry
    (availabilitySlotService.getSlots as jest.Mock).mockResolvedValueOnce(
      mockSlots
    );

    // Press retry button
    fireEvent.press(getByText("Retry"));

    // Check if API was called again
    expect(availabilitySlotService.getSlots).toHaveBeenCalledTimes(2);
  });
});
