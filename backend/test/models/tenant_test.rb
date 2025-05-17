require "test_helper"

class TenantTest < ActiveSupport::TestCase
  test "valid tenant" do
    tenant = Tenant.new(path: "valid-tenant")
    assert tenant.valid?
  end

  test "requires path" do
    tenant = Tenant.new
    assert_not tenant.valid?
    assert_includes tenant.errors[:path], "can't be blank"
  end

  test "path must be unique" do
    Tenant.create!(path: "duplicate-path")
    tenant = Tenant.new(path: "duplicate-path")
    assert_not tenant.valid?
    assert_includes tenant.errors[:path], "has already been taken"
  end

  test "normalizes path before validation" do
    tenant = Tenant.new(path: "Mixed Case Path")
    tenant.valid?
    assert_equal "mixed-case-path", tenant.path
  end

  test "has many users" do
    tenant = tenants(:one)
    assert tenant.users.any?
  end

  test "has many appointments" do
    tenant = tenants(:one)
    assert tenant.appointments.any?
  end

  test "has many availability slots" do
    tenant = tenants(:one)
    assert tenant.availability_slots.any?
  end

  test "can find by path" do
    tenant = tenants(:one)
    assert_equal tenant, Tenant.find_by(path: tenant.path)
  end
end
