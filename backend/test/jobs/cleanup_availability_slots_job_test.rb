require "test_helper"

class CleanupAvailabilitySlotsJobTest < ActiveJob::TestCase
  test "deletes past availability slots without appointments" do
    # Clear existing slots to avoid overlaps
    AvailabilitySlot.delete_all

    tenant = tenants(:one)

    # Create a past slot with no appointment
    past_slot = AvailabilitySlot.create!(
      starts_at: 10.days.ago,
      ends_at: 9.days.ago,
      tenant: tenant
    )

    # Create a past slot with an appointment
    past_slot_with_appointment = AvailabilitySlot.create!(
      starts_at: 12.days.ago,
      ends_at: 11.days.ago,
      tenant: tenant
    )
    appointment = Appointment.create!(
      availability_slot: past_slot_with_appointment,
      user: users(:user),
      tenant: tenant
    )

    # Create a future slot with no appointment
    future_slot = AvailabilitySlot.create!(
      starts_at: 1.day.from_now,
      ends_at: 2.days.from_now,
      tenant: tenant
    )

    # Run the job
    CleanupAvailabilitySlotsJob.perform_now

    # Verify that only the past slot without an appointment was deleted
    assert_raises(ActiveRecord::RecordNotFound) { past_slot.reload }
    assert_nothing_raised { past_slot_with_appointment.reload }
    assert_nothing_raised { future_slot.reload }
  end
end
