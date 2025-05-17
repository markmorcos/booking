class AppointmentMailer < ApplicationMailer
  def status_email(appointment)
    @appointment = appointment
    mail(
      to: appointment.user.email,
      subject: I18n.t("appointment_mailer.#{appointment.status}.subject"),
      template_name: "status_email"
    )
  end
end
