require "test_helper"

class AvailabilitySlotTest < ActiveSupport::TestCase
  test "valid availability slot" do
    slot = AvailabilitySlot.new(
      starts_at: 1.day.from_now,
      ends_at: 1.day.from_now + 1.hour
    )
    assert slot.valid?
  end

  test "starts_at is required" do
    slot = AvailabilitySlot.new(ends_at: 1.day.from_now + 1.hour)
    assert_not slot.valid?
    assert_includes slot.errors[:starts_at], "can't be blank"
  end

  test "ends_at is required" do
    slot = AvailabilitySlot.new(starts_at: 1.day.from_now)
    assert_not slot.valid?
    assert_includes slot.errors[:ends_at], "can't be blank"
  end

  test "ends_at must be after starts_at" do
    slot = AvailabilitySlot.new(
      starts_at: 1.day.from_now,
      ends_at: 1.day.from_now - 1.hour
    )
    assert_not slot.valid?
    assert_includes slot.errors[:ends_at], "must be after starts_at"
  end

  test "duration_minutes returns correct value" do
    slot = AvailabilitySlot.new(
      starts_at: 1.day.from_now,
      ends_at: 1.day.from_now + 45.minutes
    )
    assert_equal 45, slot.duration_minutes
  end

  test "available? returns true when no appointment exists" do
    assert availability_slots(:available_slot).available?
  end

  test "available? returns false when appointment exists" do
    assert_not availability_slots(:booked_slot).available?
  end

  test "future? returns true for future slots" do
    assert availability_slots(:future_slot).future?
  end

  test "future? returns false for past slots" do
    assert_not availability_slots(:past_slot).future?
  end

  test "overlaps_with? detects overlapping slots correctly" do
    slot1 = AvailabilitySlot.new(
      starts_at: Time.parse("2023-05-01 10:00:00"),
      ends_at: Time.parse("2023-05-01 11:00:00")
    )

    # Exact overlap
    slot2 = AvailabilitySlot.new(
      starts_at: Time.parse("2023-05-01 10:00:00"),
      ends_at: Time.parse("2023-05-01 11:00:00")
    )
    assert slot1.overlaps_with?(slot2)

    # Partial overlap (slot2 starts during slot1)
    slot3 = AvailabilitySlot.new(
      starts_at: Time.parse("2023-05-01 10:30:00"),
      ends_at: Time.parse("2023-05-01 11:30:00")
    )
    assert slot1.overlaps_with?(slot3)

    # Partial overlap (slot2 ends during slot1)
    slot4 = AvailabilitySlot.new(
      starts_at: Time.parse("2023-05-01 09:30:00"),
      ends_at: Time.parse("2023-05-01 10:30:00")
    )
    assert slot1.overlaps_with?(slot4)

    # No overlap (slot2 is after slot1)
    slot5 = AvailabilitySlot.new(
      starts_at: Time.parse("2023-05-01 11:00:00"),
      ends_at: Time.parse("2023-05-01 12:00:00")
    )
    assert_not slot1.overlaps_with?(slot5)

    # No overlap (slot2 is before slot1)
    slot6 = AvailabilitySlot.new(
      starts_at: Time.parse("2023-05-01 09:00:00"),
      ends_at: Time.parse("2023-05-01 10:00:00")
    )
    assert_not slot1.overlaps_with?(slot6)
  end
end
