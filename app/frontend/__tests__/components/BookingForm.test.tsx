import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BookingForm from "../../components/BookingForm";
import { AvailabilitySlot } from "../../types";

describe("BookingForm", () => {
  const mockSlot: AvailabilitySlot = {
    id: 123,
    start_time: "2023-10-15T10:00:00Z",
    end_time: "2023-10-15T11:00:00Z",
    booked: false,
  };

  const initialValues = {};
  const mockOnSubmit = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form fields correctly", () => {
    render(
      <BookingForm
        slot={mockSlot}
        initialValues={initialValues}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    // Check if the form renders with the correct fields
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();

    // Check if buttons are rendered
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /book appointment/i })
    ).toBeInTheDocument();
  });

  it("displays validation errors for empty required fields", async () => {
    render(
      <BookingForm
        slot={mockSlot}
        initialValues={initialValues}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    // Submit the form without filling in required fields
    fireEvent.click(screen.getByRole("button", { name: /book appointment/i }));

    // Check if validation errors are displayed
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/phone number is required/i)
    ).toBeInTheDocument();

    // onSubmit should not be called due to validation errors
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("submits the form when all required fields are filled", async () => {
    render(
      <BookingForm
        slot={mockSlot}
        initialValues={initialValues}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    // Fill in the required fields
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "123-456-7890" },
    });
    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: "Some notes" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /book appointment/i }));

    // Wait for the submission to complete
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        phone: "123-456-7890",
        notes: "Some notes",
        availability_slot_id: 123,
      });
    });
  });

  it("calls onBack when the back button is clicked", () => {
    render(
      <BookingForm
        slot={mockSlot}
        initialValues={initialValues}
        onSubmit={mockOnSubmit}
        onBack={mockOnBack}
      />
    );

    // Click the back button
    fireEvent.click(screen.getByRole("button", { name: /back/i }));

    // Check if onBack was called
    expect(mockOnBack).toHaveBeenCalled();
  });
});
