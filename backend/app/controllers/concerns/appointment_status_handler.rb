module AppointmentStatusHandler
  extend ActiveSupport::Concern

  included do
    def send_notifications(appointment, status)
      begin
        AppointmentMailer.status_email(appointment).deliver_now
        ::WhatsappService.send_event_notification(appointment, status) if appointment.user.phone.present?
      rescue StandardError => e
        Rails.logger.error("Failed to send notifications for appointment #{appointment.id}: #{e.message}")
        # Don't raise the error - we want the status change to succeed even if notifications fail
      end
    end

    def handle_status_change(appointment, status)
      return false unless appointment.respond_to?("#{status}!")

      ActiveRecord::Base.transaction do
        old_status = appointment.status
        appointment.send("#{status}!")

        if appointment.save
          send_notifications(appointment, status)
          Rails.logger.info("Appointment #{appointment.id} status changed from #{old_status} to #{status}")
          true
        else
          Rails.logger.error("Failed to save appointment #{appointment.id}: #{appointment.errors.full_messages.join(', ')}")
          false
        end
      end
    rescue StandardError => e
      Rails.logger.error("Failed to handle status change for appointment #{appointment.id}: #{e.message}")
      false
    end
  end
end
