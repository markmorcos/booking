class CreateAvailabilitySlots < ActiveRecord::Migration[8.0]
  def change
    create_table :availability_slots do |t|
      t.datetime :starts_at
      t.datetime :ends_at
      t.timestamps
    end
  end
end
