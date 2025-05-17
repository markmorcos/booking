class AppointmentSerializer < ActiveModel::Serializer
  belongs_to :availability_slot

  attributes :id, :user_id, :status, :created_at, :updated_at
  attribute :user, if: -> { object.user.present? }

  attribute :availability_slot do
    {
      id: object.availability_slot.id,
      starts_at: object.availability_slot.starts_at,
      ends_at: object.availability_slot.ends_at,
      duration_minutes: object.availability_slot.duration_minutes,
      available: object.availability_slot.available?,
      future: object.availability_slot.future?
  }
  end
end
