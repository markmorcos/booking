require "test_helper"

class AppointmentTest < ActiveSupport::TestCase
  test "valid appointment" do
    appointment = Appointment.new(
      user: users(:user),
      availability_slot: availability_slots(:available_slot),
      tenant: tenants(:one)
    )
    assert appointment.valid?
  end

  test "requires user" do
    appointment = Appointment.new(
      availability_slot: availability_slots(:available_slot),
      tenant: tenants(:one)
    )
    assert_not appointment.valid?
    assert_includes appointment.errors[:user], "must exist"
  end

  test "requires availability slot" do
    appointment = Appointment.new(
      user: users(:user),
      tenant: tenants(:one)
    )
    assert_not appointment.valid?
    assert_includes appointment.errors[:availability_slot], "must exist"
  end

  test "requires tenant" do
    appointment = Appointment.new(
      user: users(:user),
      availability_slot: availability_slots(:available_slot)
    )
    assert_not appointment.valid?
    assert_includes appointment.errors[:tenant], "must exist"
  end

  test "cannot create multiple appointments for the same slot" do
    # First, let's clear any existing data that might interfere
    tenant = tenants(:one)
    user1 = users(:user)
    user2 = users(:admin)

    # Create a slot with far-future timestamps to avoid conflicts
    test_slot = AvailabilitySlot.create!(
      starts_at: 1.year.from_now,
      ends_at: 1.year.from_now + 1.hour,
      tenant: tenant
    )

    # Create the first appointment
    first_appointment = Appointment.create!(
      user: user1,
      availability_slot: test_slot,
      tenant: tenant
    )

    # Verify it was created successfully
    assert first_appointment.persisted?

    # Now try to create another appointment for the same slot
    second_appointment = Appointment.new(
      user: user2, # Different user
      availability_slot: test_slot, # Same slot
      tenant: tenant
    )

    # Attempt to save it - this should fail because the slot is already booked
    begin
      second_appointment.save!
      assert false, "Should not allow a second appointment for the same slot"
    rescue ActiveRecord::RecordInvalid
      # This is the expected behavior
      assert true, "Properly prevented creating a second appointment"
    end

    # Or we can check validation directly
    assert_not second_appointment.valid?
  end

  test "status defaults to pending" do
    appointment = Appointment.new(
      user: users(:user),
      availability_slot: availability_slots(:available_slot)
    )
    assert_equal "pending", appointment.status
  end
end
