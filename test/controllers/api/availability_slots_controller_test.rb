require "test_helper"

class Api::AvailabilitySlotsControllerTest < ActionDispatch::IntegrationTest
  test "should get only available and future slots" do
    get api_availability_slots_url, as: :json
    assert_response :success

    # Parse the response
    response_data = JSON.parse(@response.body)
    response_data = response_data["data"] if response_data.is_a?(Hash) && response_data["data"]

    # Check that we're not getting slots that have appointments
    assert_not response_data.any? { |slot| slot["id"].to_s == availability_slots(:booked_slot).id.to_s }

    # Check that we're not getting past slots
    assert_not response_data.any? { |slot| slot["id"].to_s == availability_slots(:past_slot).id.to_s }

    # Check that we're getting available future slots
    assert response_data.any? { |slot| slot["id"].to_s == availability_slots(:available_slot).id.to_s }
  end

  test "should filter slots by date range" do
    # Set up a date range that includes our available_slot but excludes others
    slot_date = availability_slots(:available_slot).starts_at.to_date
    start_date = slot_date - 1.day
    end_date = slot_date + 1.day

    get api_availability_slots_url, params: {
      start_date: start_date.iso8601,
      end_date: end_date.iso8601
    }, as: :json

    assert_response :success

    # Parse the response
    response_data = JSON.parse(@response.body)
    response_data = response_data["data"] if response_data.is_a?(Hash) && response_data["data"]

    # Check that we're getting our slot in the range
    assert response_data.any? { |slot| slot["id"].to_s == availability_slots(:available_slot).id.to_s }

    # Check that we're not getting slots outside the range
    if availability_slots(:future_slot).starts_at.to_date < start_date ||
       availability_slots(:future_slot).starts_at.to_date > end_date
      assert_not response_data.any? { |slot| slot["id"].to_s == availability_slots(:future_slot).id.to_s }
    end
  end
end
