class AvailabilitySlot < ApplicationRecord
  has_one :appointment

  validates :starts_at, :ends_at, presence: true
  validate :ends_at_after_starts_at

  private

  def ends_at_after_starts_at
    if ends_at <= starts_at
      errors.add(:ends_at, "must be after starts_at")
    end
  end
end
