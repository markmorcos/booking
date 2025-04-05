# frozen_string_literal: true

class CreateAvailabilitySlots < ActiveRecord::Migration[8.0]
  def change
    create_table :availability_slots do |t|
      t.datetime :start_time, null: false
      t.datetime :end_time, null: false

      t.timestamps
    end

    add_index :availability_slots, :start_time
    add_index :availability_slots, :end_time
  end
end 