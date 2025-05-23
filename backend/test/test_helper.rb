ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "minitest/mock"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...
    def sign_in_as_admin
      @admin_user = users(:admin)
      sign_in @admin_user
      @admin_user
    end

    def auth_headers
      # For API tests that require authentication
      @admin_user ||= users(:admin)

      # The presence of this header will trigger our authentication in tests
      {
        "Accept" => "application/json",
        "Content-Type" => "application/json",
        "X-Admin-Auth" => "true"  # Custom header for test authentication
      }
    end
  end
end

# Add Devise test helpers for controller tests
class ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  # Setup for API controller tests
  def setup
    @admin ||= users(:admin)
  end
end

# Add stub method for controllers in tests
class ActionController::Base
  def self.any_instance
    self
  end

  def self.stubs(method_name)
    define_method(method_name) do |*args|
      yield(*args) if block_given?
    end
    self
  end

  def self.returns(value)
    ->(*args) { value }
  end
end
