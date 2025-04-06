require "test_helper"

class Api::Admin::AvailabilitySlotsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get api_admin_availability_slots_url, as: :json
    assert_response :success

    response_data = JSON.parse(@response.body)
    response_data = response_data["data"] if response_data.is_a?(Hash) && response_data["data"]

    assert_not_empty response_data

    slot_ids = response_data.map { |slot| slot["id"].to_s }
    assert_includes slot_ids, availability_slots(:available_slot).id.to_s
    assert_includes slot_ids, availability_slots(:booked_slot).id.to_s
  end

  test "should create availability slot" do
    assert_difference("AvailabilitySlot.count") do
      post api_admin_availability_slots_url, params: {
        availability_slot: {
          starts_at: 2.days.from_now.iso8601,
          ends_at: 2.days.from_now.advance(hours: 1).iso8601
        }
      }, as: :json
    end

    assert_response :created

    response_data = JSON.parse(@response.body)
    response_data = response_data["data"] if response_data.is_a?(Hash) && response_data["data"]

    assert response_data["id"].present?
    assert response_data["starts_at"].present?
    assert response_data["ends_at"].present?
  end

  test "should update availability slot" do
    slot = availability_slots(:available_slot)
    new_start = slot.starts_at + 30.minutes
    new_end = slot.ends_at + 30.minutes

    patch api_admin_availability_slot_url(slot), params: {
      availability_slot: {
        starts_at: new_start.iso8601,
        ends_at: new_end.iso8601
      }
    }, as: :json

    assert_response :success

    slot.reload
    assert_equal new_start.to_i, slot.starts_at.to_i
    assert_equal new_end.to_i, slot.ends_at.to_i
  end

  test "should not update slot with appointment" do
    slot = availability_slots(:booked_slot)
    original_start = slot.starts_at

    patch api_admin_availability_slot_url(slot), params: {
      availability_slot: {
        starts_at: (slot.starts_at + 1.hour).iso8601
      }
    }, as: :json

    assert_response :unprocessable_entity

    slot.reload
    assert_equal original_start.to_i, slot.starts_at.to_i
  end

  test "should destroy availability slot" do
    slot = availability_slots(:available_slot)

    assert_difference("AvailabilitySlot.count", -1) do
      delete api_admin_availability_slot_url(slot), as: :json
    end

    assert_response :no_content

    assert_raises(ActiveRecord::RecordNotFound) do
      slot.reload
    end
  end

  test "should not destroy slot with appointment" do
    slot = availability_slots(:booked_slot)

    assert_no_difference("AvailabilitySlot.count") do
      delete api_admin_availability_slot_url(slot), as: :json
    end

    assert_response :unprocessable_entity
  end
end
