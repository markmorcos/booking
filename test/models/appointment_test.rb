require "test_helper"

class AppointmentTest < ActiveSupport::TestCase
  test "valid appointment" do
    appointment = Appointment.new(
      booking_name: "Test User",
      booking_email: "test@example.com",
      availability_slot: availability_slots(:available_slot)
    )
    assert appointment.valid?
  end

  test "booking_name is required" do
    appointment = Appointment.new(
      booking_email: "test@example.com",
      availability_slot: availability_slots(:available_slot)
    )
    assert_not appointment.valid?
    assert_includes appointment.errors[:booking_name], "can't be blank"
  end

  test "booking_email is required" do
    appointment = Appointment.new(
      booking_name: "Test User",
      availability_slot: availability_slots(:available_slot)
    )
    assert_not appointment.valid?
    assert_includes appointment.errors[:booking_email], "can't be blank"
  end

  test "availability_slot is required" do
    appointment = Appointment.new(
      booking_name: "Test User",
      booking_email: "test@example.com"
    )
    assert_not appointment.valid?
    assert_includes appointment.errors[:availability_slot], "must exist"
  end

  test "status defaults to pending" do
    appointment = Appointment.new(
      booking_name: "Test User",
      booking_email: "test@example.com",
      availability_slot: availability_slots(:available_slot)
    )
    assert_equal "pending", appointment.status
  end
end
