# frozen_string_literal: true

class CreateAppointments < ActiveRecord::Migration[8.0]
  def change
    create_table :appointments do |t|
      t.references :availability_slot, null: false, foreign_key: true
      t.string :name, null: false
      t.string :email, null: false
      t.string :phone, null: false
      t.text :notes
      t.integer :status, default: 0, null: false

      t.timestamps
    end

    add_index :appointments, :email
    add_index :appointments, :status
  end
end 