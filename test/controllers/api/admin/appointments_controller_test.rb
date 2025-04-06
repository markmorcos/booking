require "test_helper"

class Api::Admin::AppointmentsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get api_admin_appointments_url, as: :json
    assert_response :success

    response_data = JSON.parse(@response.body)
    response_data = response_data["data"] if response_data.is_a?(Hash) && response_data["data"]

    assert_not_empty response_data

    # Verify that we get appointments with different statuses
    statuses = response_data.map { |appointment| appointment["status"].to_s }
    assert_includes statuses, "pending"
    assert_includes statuses, "confirmed"
  end

  test "should get appointment by id" do
    appointment = appointments(:pending_appointment)
    get api_admin_appointment_url(appointment), as: :json
    assert_response :success

    response_data = JSON.parse(@response.body)
    response_data = response_data["data"] if response_data.is_a?(Hash) && response_data["data"]

    assert_equal appointment.id, response_data["id"]
    assert_equal appointment.booking_name, response_data["booking_name"]
    assert_equal appointment.booking_email, response_data["booking_email"]
    assert_equal appointment.status, response_data["status"]
  end

  test "should update appointment" do
    appointment = appointments(:pending_appointment)

    patch api_admin_appointment_url(appointment), params: {
      appointment: {
        booking_name: "Updated Name"
      }
    }, as: :json

    assert_response :success

    appointment.reload
    assert_equal "Updated Name", appointment.booking_name
  end

  test "should confirm appointment" do
    appointment = appointments(:pending_appointment)

    patch approve_api_admin_appointment_url(appointment), as: :json
    assert_response :success

    appointment.reload
    assert_equal "confirmed", appointment.status
  end

  test "should cancel appointment" do
    appointment = appointments(:confirmed_appointment)

    patch cancel_api_admin_appointment_url(appointment), as: :json
    assert_response :success

    appointment.reload
    assert_equal "cancelled", appointment.status
  end

  test "should complete appointment" do
    appointment = appointments(:confirmed_appointment)

    patch complete_api_admin_appointment_url(appointment), as: :json
    assert_response :success

    appointment.reload
    assert_equal "completed", appointment.status
  end

  test "should mark appointment as no_show" do
    appointment = appointments(:confirmed_appointment)

    patch mark_no_show_api_admin_appointment_url(appointment), as: :json
    assert_response :success

    appointment.reload
    assert_equal "no_show", appointment.status
  end

  test "should destroy appointment" do
    appointment = appointments(:pending_appointment)

    assert_difference("Appointment.count", -1) do
      delete api_admin_appointment_url(appointment), as: :json
    end

    assert_response :no_content

    assert_raises(ActiveRecord::RecordNotFound) do
      appointment.reload
    end
  end
end
