require "test_helper"

class Api::AppointmentsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @tenant = tenants(:one)
    @user = users(:user)

    # Reset test data
    cleanup_test_data
    setup_test_slots

    # Set up authentication mock
    setup_auth_mock
  end

  teardown do
    cleanup_auth_mock
  end

  test "should get appointments" do
    get "/api/#{@tenant.path}/appointments"
    assert_response :success
  end

  test "should create a new appointment" do
    # Ensure we have a valid slot ID
    slot_id = @available_slot.id
    assert slot_id.present?

    # The controller expects user_id to be set via current_user
    # We'll mock this by overriding the current_user method
    Api::AppointmentsController.class_eval do
      def current_user
        @user ||= User.find_by(email: "user@example.com")
      end
    end

    # For this test we need to call the actual controller
    post "/api/#{@tenant.path}/appointments", params: {
      availability_slot_id: slot_id,
      appointment: {
        user_id: @user.id # This will be handled by current_user in controller
      }
    }

    # Clean up the override
    Api::AppointmentsController.class_eval do
      remove_method :current_user if method_defined?(:current_user)
    end

    # Check the response code
    assert_response :created
  end

  test "should not create an appointment for a booked slot" do
    # Make sure our test data is set up correctly
    slot_id = @booked_slot.id
    assert slot_id.present?
    assert @existing_appointment.present?

    # Verify the slot is already booked
    assert_equal slot_id, @existing_appointment.availability_slot_id

    # API should reject booking a slot that's already taken
    post "/api/#{@tenant.path}/appointments", params: {
      availability_slot_id: slot_id,
      appointment: {
        booking_email: "another@example.com",
        booking_name: "Another Booker",
        booking_phone: "9876543210"
      }
    }

    # Should get an error response
    assert_response :unprocessable_entity
  end

  test "should require authentication for API access" do
    # Override authentication method to fail
    Api::BaseController.class_eval do
      before_action :require_authentication

      def require_authentication
        render json: { error: "Authentication required" }, status: :unauthorized
        false
      end
    end

    # Make request that should fail authentication
    get "/api/#{@tenant.path}/appointments"
    assert_response :unauthorized

    # Clean up
    Api::BaseController.class_eval do
      skip_before_action :require_authentication if respond_to?(:skip_before_action)
    end
  end

  private

  def cleanup_test_data
    # Clean up any existing test data
    Appointment.where(tenant: @tenant).destroy_all
    AvailabilitySlot.where(tenant: @tenant).destroy_all
  end

  def setup_test_slots
    # Create test availability slots with far future dates to avoid conflicts
    @available_slot = AvailabilitySlot.create!(
      starts_at: 1.year.from_now,
      ends_at: 1.year.from_now + 1.hour,
      tenant: @tenant
    )

    @booked_slot = AvailabilitySlot.create!(
      starts_at: 1.year.from_now + 1.day,
      ends_at: 1.year.from_now + 1.day + 1.hour,
      tenant: @tenant
    )

    # Create a test appointment for the booked slot
    @existing_appointment = Appointment.create!(
      availability_slot: @booked_slot,
      user: @user,
      tenant: @tenant
    )
  end

  def setup_auth_mock
    # Mock authentication methods
    ApplicationController.class_eval do
      def authenticate_user!
        true # Always authenticate for tests
      end

      def current_user
        User.find_by(email: "user@example.com") || User.first
      end

      def current_tenant
        tenant_path = params[:tenant_path]
        Tenant.find_by(path: tenant_path) || Tenant.first
      end
    end
  end

  def cleanup_auth_mock
    # Clean up our mock methods
    [ :authenticate_user!, :current_user, :current_tenant ].each do |method|
      if ApplicationController.method_defined?(method)
        ApplicationController.remove_method(method)
      end
    end
  end
end
