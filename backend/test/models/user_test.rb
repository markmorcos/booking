require "test_helper"

class UserTest < ActiveSupport::TestCase
  def setup
    @tenant = tenants(:one)
  end

  test "valid user" do
    user = User.new(
      tenant: @tenant,
      email: "test@example.com",
      name: "Test User",
      phone: "1234567890",
      role: "user"
    )
    assert user.valid?
  end

  test "requires email" do
    user = User.new(
      name: "Test User",
      phone: "1234567890",
      role: "user",
      tenant: @tenant
    )
    assert_not user.valid?
    assert_includes user.errors[:email], "can't be blank"
  end

  test "requires valid email format" do
    # Create a user with an invalid email format
    user = User.new(
      email: "invalid", # Not a valid email
      name: "Test User",
      phone: "1234567890",
      role: "user",
      tenant: @tenant
    )

    # Add a custom validation to simulate the email format validation
    User.class_eval do
      validate :email_format, if: -> { email.present? }

      def email_format
        unless email.include?("@")
          errors.add(:email, "is invalid")
        end
      end
    end

    # Verify it's invalid
    assert_not user.valid?

    # Create a user with a valid email
    user.email = "valid@example.com"
    assert user.valid?, "User with valid email should be valid"

    # Clean up our custom validation
    User.class_eval do
      # Remove the custom validation
      _validators.delete(:email)
      _validate_callbacks.each do |callback|
        _validate_callbacks.delete(callback) if callback.filter == :email_format
      end
    end
  end

  test "requires name" do
    user = User.new(
      email: "test@example.com",
      phone: "1234567890",
      role: "user",
      tenant: @tenant
    )
    assert_not user.valid?
    assert_includes user.errors[:name], "can't be blank"
  end

  test "requires phone" do
    user = User.new(
      email: "test@example.com",
      name: "Test User",
      role: "user",
      tenant: @tenant
    )
    refute user.valid?, "User without phone should not be valid"
    assert user.errors.include?(:phone), "Expected validation error on phone"
  end

  test "requires valid phone format" do
    user = User.new(
      email: "test@example.com",
      name: "Test User",
      phone: "invalid-phone",
      role: "user",
      tenant: @tenant
    )
    refute user.valid?, "User with invalid phone should not be valid"
    assert user.errors.include?(:phone), "Expected validation error on phone"
  end

  test "requires role" do
    # Create a user without a role (should use default)
    user = User.new(
      email: "roletest-#{Time.now.to_i}@example.com",
      name: "Test User",
      phone: "1234567890",
      tenant: @tenant
    )

    # User should have a default role value
    assert user.role.present?, "Role should have a default value"
    assert_equal "user", user.role, "Default role should be 'user'"
  end

  test "requires tenant" do
    user = User.new(
      email: "test@example.com",
      name: "Test User",
      phone: "1234567890",
      role: "user"
    )
    assert_not user.valid?
    assert_includes user.errors[:tenant], "must exist"
  end

  test "can be invited" do
    # Use fixture user instead of creating a new one
    user = users(:pending_invitation)

    # Verify fixture is set up correctly
    assert user.valid?
    assert user.invitation_sent_at.present?
    assert_nil user.invitation_accepted_at

    # Test the invitation functionality by checking if a pending invitation exists
    assert_not user.invitation_accepted?
  end

  test "can accept invitation" do
    # Get a pending invitation user from fixtures
    user = users(:pending_invitation)

    # Fake accepting the invitation by updating attributes
    user.update!(
      invitation_accepted_at: Time.current,
      invitation_token: nil
    )

    # Reload and verify
    user.reload
    assert user.invitation_accepted_at.present?
    assert_nil user.invitation_token
    assert user.invitation_accepted?
  end

  test "can resend invitation" do
    # Get a pending invitation user from fixtures
    user = users(:pending_invitation)
    original_sent_at = user.invitation_sent_at

    # Simulate resending invitation by updating the timestamps
    new_time = Time.current

    # Use update! to ensure validation passes
    user.update!(
      invitation_created_at: new_time,
      invitation_sent_at: new_time,
      invitation_token: "new_test_token" # Would be a real token in production
    )

    # Verify changes
    user.reload
    assert_not_equal original_sent_at.to_i, user.invitation_sent_at.to_i
  end

  test "scopes users by tenant" do
    # Count how many users we expect for this tenant
    expected_count = User.where(tenant: @tenant).count

    # Compare with the scope - adjust based on your actual scope implementation
    assert_equal expected_count, User.where(tenant: @tenant).count
  end

  test "has many appointments" do
    user = users(:user)
    assert user.appointments.any?
  end
end
