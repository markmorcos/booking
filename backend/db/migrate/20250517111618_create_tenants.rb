class CreateTenants < ActiveRecord::Migration[8.0]
  def change
    create_table :tenants do |t|
      t.string :path, null: false

      t.timestamps
    end

    add_index :tenants, :path, unique: true
  end
end
