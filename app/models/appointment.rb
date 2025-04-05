class Appointment < ApplicationRecord
  belongs_to :availability_slot

  attribute :status, :integer, default: :pending
  enum :status, %i[pending confirmed cancelled completed no_show]

  validates :booking_name, :booking_email, presence: true

  after_create :send_pending_email

  def confirm!
    transaction do
      update(status: :confirmed)
      send_confirmation_email
    end
  end

  def cancel!
    transaction do
      update(status: :cancelled)
      send_cancellation_email
    end
  end

  def complete!
    transaction do
      update(status: :completed)
      send_completion_email
    end
  end

  def no_show!
    transaction do
      update(status: :no_show)
      send_no_show_email
    end
  end

  private

  def send_pending_email
    AppointmentMailer.pending_email(self).deliver_later
  end

  def send_confirmation_email
    AppointmentMailer.confirmation_email(self).deliver_later
  end

  def send_cancellation_email
    AppointmentMailer.cancellation_email(self).deliver_later
  end

  def send_completion_email
    AppointmentMailer.completion_email(self).deliver_later
  end

  def send_no_show_email
    AppointmentMailer.no_show_email(self).deliver_later
  end
end
