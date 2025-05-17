require "test_helper"

class Api::AppointmentsControllerTest < ActionDispatch::IntegrationTest
  test "should create a new appointment" do
    # Use an available slot from fixtures
    slot = availability_slots(:available_slot)
    user = users(:user)

    assert_difference("Appointment.count") do
      post api_appointments_url, params: {
        user_id: user.id,
        availability_slot_id: slot.id
      }, as: :json
    end

    assert_response :created
  end

  test "should not create an appointment for a booked slot" do
    # Use a slot that already has an appointment
    slot = availability_slots(:booked_slot)
    user = users(:user)

    assert_no_difference("Appointment.count") do
      post api_appointments_url, params: {
        user_id: user.id,
        availability_slot_id: slot.id
      }, as: :json
    end

    assert_response :unprocessable_entity
  end

  test "should require user" do
    slot = availability_slots(:available_slot)

    assert_no_difference("Appointment.count") do
      post api_appointments_url, params: {
        user_id: nil,
        availability_slot_id: slot.id
      }, as: :json
    end

    assert_response :unprocessable_entity
  end
end
