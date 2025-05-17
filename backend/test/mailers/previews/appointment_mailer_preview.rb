# Preview all emails at http://localhost:3000/rails/mailers/appointment_mailer
class AppointmentMailerPreview < ActionMailer::Preview
  def pending_email
    appointment = Appointment.first
    appointment.status = :pending
    AppointmentMailer.status_email(appointment)
  end

  def confirmation_email
    appointment = Appointment.first
    appointment.status = :confirmed
    AppointmentMailer.status_email(appointment)
  end

  def cancellation_email
    appointment = Appointment.first
    appointment.status = :cancelled
    AppointmentMailer.status_email(appointment)
  end

  def completion_email
    appointment = Appointment.first
    appointment.status = :completed
    AppointmentMailer.status_email(appointment)
  end

  def no_show_email
    appointment = Appointment.first
    appointment.status = :no_show
    AppointmentMailer.status_email(appointment)
  end
end
