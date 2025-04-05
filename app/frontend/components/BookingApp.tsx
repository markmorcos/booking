import React, { useState } from "react";
import BookingForm from "./BookingForm";
import SlotSelector from "./SlotSelector";
import SuccessMessage from "./SuccessMessage";
import { AvailabilitySlot, AppointmentFormData } from "../types";

enum BookingStep {
  SELECT_SLOT,
  ENTER_DETAILS,
  SUCCESS,
}

const BookingApp: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<BookingStep>(
    BookingStep.SELECT_SLOT
  );
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<AppointmentFormData>>({});
  const [error, setError] = useState<string | null>(null);

  const handleSlotSelect = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    setFormData({
      ...formData,
      availability_slot_id: slot.id,
    });
    setCurrentStep(BookingStep.ENTER_DETAILS);
  };

  const handleFormSubmit = async (data: AppointmentFormData) => {
    setError(null);
    try {
      const response = await fetch("/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-Token":
            document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content") || "",
        },
        body: JSON.stringify({ appointment: data }),
      });

      if (response.ok) {
        setCurrentStep(BookingStep.SUCCESS);
      } else {
        const errorData = await response.json();
        setError(
          errorData.errors
            ? Object.values(errorData.errors).flat().join(", ")
            : "An error occurred"
        );
      }
    } catch (err) {
      setError("An error occurred while processing your request");
    }
  };

  const handleBack = () => {
    if (currentStep === BookingStep.ENTER_DETAILS) {
      setCurrentStep(BookingStep.SELECT_SLOT);
    }
  };

  const handleStartOver = () => {
    setCurrentStep(BookingStep.SELECT_SLOT);
    setSelectedSlot(null);
    setFormData({});
    setError(null);
  };

  return (
    <div className="booking-app">
      <header className="booking-header">
        <h1>Book an Appointment with Fr. Youhanna Makin</h1>
      </header>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {currentStep === BookingStep.SELECT_SLOT && (
        <SlotSelector onSelectSlot={handleSlotSelect} />
      )}

      {currentStep === BookingStep.ENTER_DETAILS && selectedSlot && (
        <BookingForm
          slot={selectedSlot}
          initialValues={formData}
          onSubmit={handleFormSubmit}
          onBack={handleBack}
        />
      )}

      {currentStep === BookingStep.SUCCESS && (
        <SuccessMessage onStartOver={handleStartOver} />
      )}
    </div>
  );
};

export default BookingApp;
