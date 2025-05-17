require "application_system_test_case"

class Admin::UsersTest < ApplicationSystemTestCase
  setup do
    @user = users(:one)
    @tenant = tenants(:one)
    sign_in users(:one)
  end

  test "visiting the index" do
    visit admin_users_path(tenant_path: @tenant.path)
    assert_selector "h1", text: "Users"
  end

  test "creating a User" do
    visit admin_users_path(tenant_path: @tenant.path)
    click_on "New User"

    fill_in "Name", with: "New User"
    fill_in "Email", with: "new@example.com"
    fill_in "Phone", with: "1234567890"
    click_on "Create User"

    assert_text "User was successfully created and invitation email sent."
    click_on "Back"
  end

  test "updating a User" do
    visit admin_users_path(tenant_path: @tenant.path)
    click_on "Edit", match: :first

    fill_in "Name", with: "Updated Name"
    fill_in "Phone", with: "9876543210"
    click_on "Update User"

    assert_text "User was successfully updated."
    click_on "Back"
  end

  test "destroying a User" do
    visit admin_users_path(tenant_path: @tenant.path)
    page.accept_confirm do
      click_on "Delete", match: :first
    end

    assert_text "User was successfully deleted."
  end

  test "resending invitation" do
    user = users(:pending_invitation)
    visit admin_user_path(tenant_path: @tenant.path, id: user)

    page.accept_confirm do
      click_on "Resend Invitation"
    end

    assert_text "Invitation was successfully resent."
  end

  test "cannot access users from different tenant" do
    other_tenant = tenants(:two)
    other_user = users(:two)

    visit admin_user_path(tenant_path: other_tenant.path, id: other_user)
    assert_current_path admin_users_path(tenant_path: @tenant.path)
  end
end
