import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SlotSelector from "../../components/SlotSelector";
import { AvailabilitySlot } from "../../types";

// Mock fetch globally
global.fetch = jest.fn();

describe("SlotSelector", () => {
  const mockOnSelectSlot = jest.fn();
  const mockSlots: AvailabilitySlot[] = [
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

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful response for fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockSlots,
    });
  });

  it("renders loading state initially", () => {
    render(<SlotSelector onSelectSlot={mockOnSelectSlot} />);
    expect(screen.getByText(/loading available slots/i)).toBeInTheDocument();
  });

  it("displays available slots after fetching", async () => {
    render(<SlotSelector onSelectSlot={mockOnSelectSlot} />);

    // Wait for slots to load
    await waitFor(() => {
      expect(
        screen.queryByText(/loading available slots/i)
      ).not.toBeInTheDocument();
    });

    // Check if slots are rendered
    mockSlots.forEach((slot) => {
      // We don't know exactly what the formatted time will look like due to timezones,
      // but we can check for the date which should be consistent
      expect(
        screen.getByText(/october 15, 2023/i, { exact: false })
      ).toBeInTheDocument();
    });
  });

  it("handles slot selection", async () => {
    render(<SlotSelector onSelectSlot={mockOnSelectSlot} />);

    // Wait for slots to load
    await waitFor(() => {
      expect(
        screen.queryByText(/loading available slots/i)
      ).not.toBeInTheDocument();
    });

    // Select the first slot
    const slotButtons = screen.getAllByRole("button");
    // Find the button for slot selection (not previous/next week buttons)
    const slotButton = slotButtons.find(
      (button) =>
        !button.textContent?.includes("Previous") &&
        !button.textContent?.includes("Next")
    );

    fireEvent.click(slotButton!);

    // Check if onSelectSlot was called with the correct slot
    expect(mockOnSelectSlot).toHaveBeenCalledWith(mockSlots[0]);
  });

  it("handles navigation between weeks", async () => {
    render(<SlotSelector onSelectSlot={mockOnSelectSlot} />);

    // Wait for slots to load
    await waitFor(() => {
      expect(
        screen.queryByText(/loading available slots/i)
      ).not.toBeInTheDocument();
    });

    // Reset mock to track next call
    (global.fetch as jest.Mock).mockClear();

    // Click next week button
    fireEvent.click(screen.getByText(/next week/i));

    // Verify fetch was called again with new dates
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Reset mock again
    (global.fetch as jest.Mock).mockClear();

    // Click previous week button
    fireEvent.click(screen.getByText(/previous week/i));

    // Verify fetch was called again
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("handles error state", async () => {
    // Mock failed response
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    render(<SlotSelector onSelectSlot={mockOnSelectSlot} />);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
    });

    // Check if retry button is displayed
    expect(screen.getByText(/try again/i)).toBeInTheDocument();

    // Reset mock to simulate successful retry
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSlots,
    });

    // Click retry button
    fireEvent.click(screen.getByText(/try again/i));

    // Verify fetch was called again
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
