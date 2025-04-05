import React, { useState } from "react";
import { AvailabilitySlot, AppointmentFormData } from "../types";
import { format, parseISO } from "date-fns";

interface BookingFormProps {
  slot: AvailabilitySlot;
  initialValues: Partial<AppointmentFormData>;
  onSubmit: (data: AppointmentFormData) => void;
  onBack: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  slot,
  initialValues,
  onSubmit,
  onBack,
}) => {
  const [formData, setFormData] = useState<Partial<AppointmentFormData>>({
    ...initialValues,
    availability_slot_id: slot.id,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Name is required";
    }

    if (!formData.email || formData.email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone || formData.phone.trim() === "") {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    // The form data should now be valid and complete
    onSubmit(formData as AppointmentFormData);
  };

  const formatSlotTime = () => {
    const start = parseISO(slot.start_time);
    const end = parseISO(slot.end_time);
    return `${format(start, "EEEE, MMMM d, yyyy")} at ${format(
      start,
      "h:mm a"
    )} - ${format(end, "h:mm a")}`;
  };

  return (
    <div className="booking-form">
      <h2>Enter Your Information</h2>

      <div className="selected-slot">
        <h3>Selected Time Slot:</h3>
        <p>{formatSlotTime()}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            className={errors.name ? "error" : ""}
            disabled={submitting}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            className={errors.email ? "error" : ""}
            disabled={submitting}
          />
          {errors.email && (
            <span className="error-message">{errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            className={errors.phone ? "error" : ""}
            disabled={submitting}
          />
          {errors.phone && (
            <span className="error-message">{errors.phone}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes || ""}
            onChange={handleChange}
            rows={4}
            disabled={submitting}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onBack} disabled={submitting}>
            Back
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Book Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
