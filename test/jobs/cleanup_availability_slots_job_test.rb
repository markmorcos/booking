require "test_helper"

class CleanupAvailabilitySlotsJobTest < ActiveJob::TestCase
  test "deletes past availability slots without appointments" do
    # Create a past slot with no appointment
    past_slot = AvailabilitySlot.create!(
      starts_at: 2.days.ago,
      ends_at: 1.day.ago
    )

    # Create a past slot with an appointment
    past_slot_with_appointment = AvailabilitySlot.create!(
      starts_at: 2.days.ago,
      ends_at: 1.day.ago
    )
    appointment = Appointment.create!(
      availability_slot: past_slot_with_appointment,
      booking_name: "Test User",
      booking_email: "test@example.com"
    )

    # Create a future slot with no appointment
    future_slot = AvailabilitySlot.create!(
      starts_at: 1.day.from_now,
      ends_at: 2.days.from_now
    )

    # Run the job
    CleanupAvailabilitySlotsJob.perform_now

    # Verify that only the past slot without an appointment was deleted
    assert_raises(ActiveRecord::RecordNotFound) { past_slot.reload }
    assert_nothing_raised { past_slot_with_appointment.reload }
    assert_nothing_raised { future_slot.reload }
  end
end