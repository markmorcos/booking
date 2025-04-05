# Preview all emails at http://localhost:3000/rails/mailers/appointment_mailer
class AppointmentMailerPreview < ActionMailer::Preview
  def pending_email
    appointment = Appointment.new(
      booking_name: "John Doe",
      booking_email: "john.doe@example.com",
      booking_phone: "1234567890",
      availability_slot: AvailabilitySlot.new(
        starts_at: "2025-04-01 09:00:00",
        ends_at: "2025-04-01 10:00:00"
      )
    )
    AppointmentMailer.pending_email(appointment)
  end

  def confirmation_email
    appointment = Appointment.new(
      booking_name: "John Doe",
      booking_email: "john.doe@example.com",
      booking_phone: "1234567890",
      availability_slot: AvailabilitySlot.new(
        starts_at: "2025-04-01 09:00:00",
        ends_at: "2025-04-01 10:00:00"
      )
    )
    AppointmentMailer.confirmation_email(appointment)
  end

  def cancellation_email
    appointment = Appointment.new(
      booking_name: "John Doe",
      booking_email: "john.doe@example.com",
      booking_phone: "1234567890",
      availability_slot: AvailabilitySlot.new(
        starts_at: "2025-04-01 09:00:00",
        ends_at: "2025-04-01 10:00:00"
      )
    )
    AppointmentMailer.cancellation_email(appointment)
  end

  def completion_email
    appointment = Appointment.new(
      booking_name: "John Doe",
      booking_email: "john.doe@example.com",
      booking_phone: "1234567890",
      availability_slot: AvailabilitySlot.new(
        starts_at: "2025-04-01 09:00:00",
        ends_at: "2025-04-01 10:00:00"
      )
    )
    AppointmentMailer.completion_email(appointment)
  end

  def no_show_email
    appointment = Appointment.find(1)
    AppointmentMailer.no_show_email(appointment)
  end
end
