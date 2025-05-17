class AddTenantIdToAvailabilitySlots < ActiveRecord::Migration[8.0]
  def change
    add_column :availability_slots, :tenant_id, :bigint
    add_index :availability_slots, :tenant_id
    add_foreign_key :availability_slots, :tenants
  end
end
