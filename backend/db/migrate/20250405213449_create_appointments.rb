class CreateAppointments < ActiveRecord::Migration[8.0]
  def change
    create_table :appointments do |t|
      t.references :user, null: false
      t.references :availability_slot, null: false
      t.string :status, null: false
      t.timestamps
    end
  end
end
