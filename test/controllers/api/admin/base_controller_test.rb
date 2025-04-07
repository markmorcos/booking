require "test_helper"

class Api::Admin::BaseControllerTest < ActionDispatch::IntegrationTest
  # Test authentication and authorization for admin endpoints
  test "should authenticate admin requests" do
    # Create a test controller instance that we can test methods on
    controller = Api::Admin::BaseController.new

    # Verify the controller has the authorize_admin! method
    assert controller.respond_to?(:authorize_admin!, true)

    # Test unauthorized access
    get "/api/admin/appointments"
    assert_response :unauthorized

    # Now let's test with authentication
    # We'll do this by making an authenticated request
    get "/api/admin/appointments", headers: auth_headers
    assert_response :success
  end
end
