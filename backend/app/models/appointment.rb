class Appointment < ApplicationRecord
  belongs_to :tenant
  belongs_to :user
  belongs_to :availability_slot

  enum :status, {
    pending: "pending",
    confirmed: "confirmed",
    cancelled: "cancelled",
    completed: "completed",
    no_show: "no_show"
  }, default: :pending

  validates :tenant, presence: true
  validates :user, presence: true
  validates :availability_slot, presence: true

  validate :availability_slot_not_booked, if: -> { availability_slot.present? }

  scope :tenant_path, ->(path) { joins(:tenant).where(tenants: { path: path }) }
  scope :for_tenant, ->(tenant) { where(tenant_id: tenant.id) }
  scope :future, -> { joins(:availability_slot).where("availability_slots.starts_at > ?", Time.current) }
  scope :past, -> { joins(:availability_slot).where("availability_slots.starts_at < ?", Time.current) }
  scope :today, -> { joins(:availability_slot).where("DATE(availability_slots.starts_at) = ?", Date.current) }
  scope :completed, -> { where(status: :completed) }
  scope :no_show, -> { where(status: :no_show) }

  private

  def availability_slot_not_booked
    # Skip if this is an existing record
    return if persisted? && !availability_slot_id_changed?

    existing = Appointment.where(availability_slot_id: availability_slot_id).where.not(id: id).exists?

    if existing
      errors.add(:availability_slot, "is already booked")
    end
  end
end
