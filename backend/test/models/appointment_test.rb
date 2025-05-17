require "test_helper"

class AppointmentTest < ActiveSupport::TestCase
  test "valid appointment" do
    appointment = Appointment.new(
      user: users(:user),
      availability_slot: availability_slots(:available_slot)
    )
    assert appointment.valid?
  end

  test "user is required" do
    appointment = Appointment.new(
      availability_slot: availability_slots(:available_slot)
    )
    assert_not appointment.valid?
    assert_includes appointment.errors[:user], "can't be blank"
  end

  test "availability_slot is required" do
    appointment = Appointment.new(
      user: users(:user),
    )
    assert_not appointment.valid?
    assert_includes appointment.errors[:availability_slot], "must exist"
  end

  test "status defaults to pending" do
    appointment = Appointment.new(
      user: users(:user),
      availability_slot: availability_slots(:available_slot)
    )
    assert_equal "pending", appointment.status
  end
end
