class AvailabilitySlotSerializer < ActiveModel::Serializer
  attributes :id, :starts_at, :ends_at, :duration_minutes, :available, :future
  has_one :appointment

  def available
    object.available?
  end

  def future
    object.future?
  end
end
