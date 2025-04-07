class Appointment < ApplicationRecord
  belongs_to :availability_slot

  enum :status, {
    pending: "pending",
    confirmed: "confirmed",
    cancelled: "cancelled",
    completed: "completed",
    no_show: "no_show"
  }, default: :pending

  validates :booking_name, :booking_email, presence: true
  validates :booking_email, format: { with: URI::MailTo::EMAIL_REGEXP }

  scope :future, -> { joins(:availability_slot).where("availability_slots.starts_at > ?", Time.current) }
  scope :past, -> { joins(:availability_slot).where("availability_slots.starts_at < ?", Time.current) }
  scope :today, -> { joins(:availability_slot).where("DATE(availability_slots.starts_at) = ?", Date.current) }
  scope :upcoming, -> { joins(:availability_slot).where("availability_slots.starts_at > ?", Time.current) }
  scope :completed, -> { where(status: :completed) }
  scope :no_show, -> { where(status: :no_show) }
end
