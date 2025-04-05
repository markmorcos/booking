class AppointmentMailer < ApplicationMailer
  def pending_email(appointment)
    @appointment = appointment
    mail(to: appointment.booking_email, subject: I18n.t("appointment_mailer.pending_email.subject"))
  end

  def confirmation_email(appointment)
    @appointment = appointment
    mail(to: appointment.booking_email, subject: I18n.t("appointment_mailer.confirmation_email.subject"))
  end

  def cancellation_email(appointment)
    @appointment = appointment
    mail(to: appointment.booking_email, subject: I18n.t("appointment_mailer.cancellation_email.subject"))
  end

  def completion_email(appointment)
    @appointment = appointment
    mail(to: appointment.booking_email, subject: I18n.t("appointment_mailer.completion_email.subject"))
  end

  def no_show_email(appointment)
    @appointment = appointment
    mail(to: appointment.booking_email, subject: I18n.t("appointment_mailer.no_show_email.subject"))
  end
end
