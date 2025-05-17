class AddTenantIdToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :tenant_id, :bigint
    add_index :users, :tenant_id
    add_foreign_key :users, :tenants

    remove_index :users, :email if index_exists?(:users, :email)
    add_index :users, [ :tenant_id, :email ], unique: true
  end
end
