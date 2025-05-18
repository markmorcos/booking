class AppointmentMailer < ApplicationMailer
  def status_email(appointment)
    @appointment = appointment
    @tenant = appointment.tenant
    @slot = appointment.availability_slot

    cal = Icalendar::Calendar.new
    cal.event do |e|
      e.dtstart = @slot.starts_at
      e.dtend = @slot.ends_at
      e.summary = "Appointment with #{@tenant.path}"
      e.description = "Your appointment with #{@tenant.path}"
      e.organizer = "mailto:#{@tenant.owner.email}"
      e.attendee = "mailto:#{@appointment.user.email}"
    end

    attachments['appointment.ics'] = {
      mime_type: 'text/calendar',
      content: cal.to_ical
    }

    mail(
      to: appointment.user.email,
      subject: I18n.t("appointment_mailer.#{appointment.status}.subject"),
      template_name: "status_email"
    )
  end
end
