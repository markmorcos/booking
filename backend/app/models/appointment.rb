class Appointment < ApplicationRecord
  belongs_to :user
  belongs_to :availability_slot

  enum :status, {
    pending: "pending",
    confirmed: "confirmed",
    cancelled: "cancelled",
    completed: "completed",
    no_show: "no_show"
  }, default: :pending

  validates :user, presence: true
  validates :availability_slot, presence: true

  scope :future, -> { joins(:availability_slot).where("availability_slots.starts_at > ?", Time.current) }
  scope :past, -> { joins(:availability_slot).where("availability_slots.starts_at < ?", Time.current) }
  scope :today, -> { joins(:availability_slot).where("DATE(availability_slots.starts_at) = ?", Date.current) }
  scope :upcoming, -> { joins(:availability_slot).where("availability_slots.starts_at > ?", Time.current) }
  scope :completed, -> { where(status: :completed) }
  scope :no_show, -> { where(status: :no_show) }
end
