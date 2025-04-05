# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Create admin user
AdminUser.create!(
  email: ENV.fetch('ADMIN_EMAIL', 'admin@fr-youhanna-makin.com'),
  password: ENV.fetch('ADMIN_PASSWORD', 'password'),
  name: 'Admin User'
)

puts "Admin user created: #{AdminUser.first.email}"

# Create some availability slots
start_date = Date.today.beginning_of_week + 1.week
(0..4).each do |day_offset|
  current_date = start_date + day_offset.days
  
  # Morning slots
  (9..11).each do |hour|
    AvailabilitySlot.create!(
      start_time: current_date.to_datetime.change(hour: hour),
      end_time: current_date.to_datetime.change(hour: hour + 1)
    )
  end
  
  # Afternoon slots
  (13..16).each do |hour|
    AvailabilitySlot.create!(
      start_time: current_date.to_datetime.change(hour: hour),
      end_time: current_date.to_datetime.change(hour: hour + 1)
    )
  end
end

puts "Created #{AvailabilitySlot.count} availability slots"
