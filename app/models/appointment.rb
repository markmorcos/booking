# app/models/appointment.rb
class Appointment < ApplicationRecord
  belongs_to :availability_slot
  
  enum status: { pending: 0, confirmed: 1, cancelled: 2 }
  
  validates :name, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :availability_slot_id, presence: true, uniqueness: true
  validates :phone, presence: true
  
  scope :upcoming, -> { joins(:availability_slot).where('availability_slots.start_time > ?', Time.current) }
  scope :past, -> { joins(:availability_slot).where('availability_slots.end_time < ?', Time.current) }
  scope :date_range, ->(start_date, end_date) {
    joins(:availability_slot).where('availability_slots.start_time >= ? AND availability_slots.end_time <= ?', 
                                   start_date.beginning_of_day, 
                                   end_date.present? ? end_date.end_of_day : start_date.end_of_day)
  }
  
  after_create :send_confirmation_email
  after_update :send_status_update_email, if: :saved_change_to_status?
  
  def start_time
    availability_slot.start_time
  end
  
  def end_time
    availability_slot.end_time
  end
  
  def duration_in_minutes
    availability_slot.duration_in_minutes
  end
  
  def confirm!
    update(status: :confirmed)
  end
  
  def cancel!
    update(status: :cancelled)
  end
  
  private
  
  def send_confirmation_email
    # In a real application, this would send an email
    # AppointmentMailer.confirmation(self).deliver_later
    Rails.logger.info "Confirmation email would be sent to #{email} for appointment ##{id}"
  end
  
  def send_status_update_email
    # In a real application, this would send an email
    # AppointmentMailer.status_update(self).deliver_later
    Rails.logger.info "Status update email would be sent to #{email} for appointment ##{id} (#{status})"
  end
end 