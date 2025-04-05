class AppointmentSerializer < ActiveModel::Serializer
  attributes :id, :booking_name, :booking_email, :status, :created_at, :updated_at
  belongs_to :availability_slot
end
