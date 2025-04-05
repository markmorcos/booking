class AvailabilitySlot < ApplicationRecord
  has_one :appointment

  validates :starts_at, :ends_at, presence: true
  validate :ends_at_after_starts_at

  # Scope for available slots (no appointments)
  scope :available, -> { left_joins(:appointment).where(appointments: { id: nil }) }

  # Scope for future slots
  scope :future, -> { where("starts_at > ?", Time.current) }

  # Duration in minutes
  def duration_minutes
    ((ends_at - starts_at) / 60).to_i
  end

  # Check if slot is available (no appointment)
  def available?
    appointment.nil?
  end

  # Check if slot is in the future
  def future?
    starts_at > Time.current
  end

  # Check if this slot overlaps with another slot
  def overlaps_with?(other_slot)
    (starts_at < other_slot.ends_at && ends_at > other_slot.starts_at) ||
    (other_slot.starts_at < ends_at && other_slot.ends_at > starts_at) ||
    (starts_at >= other_slot.starts_at && ends_at <= other_slot.ends_at) ||
    (other_slot.starts_at >= starts_at && other_slot.ends_at <= ends_at)
  end

  private

  def ends_at_after_starts_at
    if ends_at <= starts_at
      errors.add(:ends_at, "must be after starts_at")
    end
  end
end
