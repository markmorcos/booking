class Appointment < ApplicationRecord
  belongs_to :availability_slot

  attribute :status, :integer, default: :pending
  enum :status, %i[pending confirmed cancelled completed no_show]

  validates :booking_name, :booking_email, presence: true
end
