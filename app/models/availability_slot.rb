class AvailabilitySlot < ApplicationRecord
  has_one :appointment

  validates :starts_at, :ends_at, presence: true
  validate :ends_at_after_starts_at

  scope :available, -> { left_joins(:appointment).where(appointments: { id: nil }).where("ends_at >= ?", Time.current) }

  scope :future, -> { where("ends_at >= ?", Time.current) }

  def duration_minutes
    ((ends_at - starts_at) / 60).to_i
  end

  def available?
    appointment.nil? && ends_at >= Time.current
  end

  def future?
    starts_at > Time.current
  end

  def overlaps_with?(other_slot)
    (starts_at < other_slot.ends_at && ends_at > other_slot.starts_at) ||
    (other_slot.starts_at < ends_at && other_slot.ends_at > starts_at) ||
    (starts_at >= other_slot.starts_at && ends_at <= other_slot.ends_at) ||
    (other_slot.starts_at >= starts_at && other_slot.ends_at <= ends_at)
  end

  private

  def ends_at_after_starts_at
    return unless starts_at && ends_at
    errors.add(:ends_at, "must be after starts_at") if ends_at <= starts_at
  end
end
