class CreateAppointments < ActiveRecord::Migration[8.0]
  def change
    create_table :appointments do |t|
      t.references :availability_slot, null: false
      t.string :booking_name, null: false
      t.string :booking_email, null: false
      t.string :booking_phone
      t.string :status, null: false
      t.timestamps
    end
  end
end
