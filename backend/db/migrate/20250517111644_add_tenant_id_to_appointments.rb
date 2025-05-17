class AddTenantIdToAppointments < ActiveRecord::Migration[8.0]
  def change
    add_column :appointments, :tenant_id, :bigint
    add_index :appointments, :tenant_id
    add_foreign_key :appointments, :tenants
  end
end
