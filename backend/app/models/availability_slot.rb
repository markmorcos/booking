class AvailabilitySlot < ApplicationRecord
  belongs_to :tenant
  has_one :appointment, dependent: :destroy

  validates :starts_at, presence: true
  validates :ends_at, presence: true
  validate :ends_at_after_starts_at
  validate :no_overlapping_slots

  scope :tenant_path, ->(path) { joins(:tenant).where(tenants: { path: path }) }
  scope :for_tenant, ->(tenant) { where(tenant_id: tenant.id) }
  scope :available, -> { left_joins(:appointment).where(appointments: { id: nil }).where("ends_at >= ?", Time.current) }
  scope :future, -> { where("ends_at >= ?", Time.current) }

  def duration_minutes
    ((ends_at - starts_at) / 60).to_i
  end

  def available?
    appointment.nil? && ends_at >= Time.current
  end

  def future?
    ends_at >= Time.current
  end

  def overlaps_with?(other_slot)
    return false if other_slot.nil?
    (starts_at < other_slot.ends_at && ends_at > other_slot.starts_at)
  end

  private

  def ends_at_after_starts_at
    return unless starts_at && ends_at
    errors.add(:ends_at, "must be after starts_at") if ends_at <= starts_at
  end

  def no_overlapping_slots
    return unless starts_at && ends_at
    return unless tenant.present? # Skip validation if tenant is nil

    overlapping_slots = tenant.availability_slots
                            .where.not(id: id) # Exclude self when updating
                            .where("starts_at < ? AND ends_at > ?", ends_at, starts_at)

    if overlapping_slots.any?
      errors.add(:base, "This time slot overlaps with existing slots")
    end
  end
end
