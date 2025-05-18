# Create tenant
tenants = ["me", "youhanna"]

tenants.each do |tenant|
  Tenant.create!(path: tenant) unless Tenant.exists?(path: tenant)
end

# Create users for the tenant
users = [
  {
    tenant: Tenant.first,
    email: 'mark.yehia@gmail.com',
    password: ENV['ADMIN_PASSWORD'],
    role: "admin",
    name: "Mark Morcos",
    phone: "+4915145081729",
    confirmed_at: Time.current
  },
  {
    tenant: Tenant.last,
    email: 'youhanna_makin@yahoo.com',
    password: ENV['ADMIN_PASSWORD'],
    role: "admin",
    name: "Fr. Youhanna Makin",
    phone: "+201222360706",
    confirmed_at: Time.current
  }
]

users.each do |user_attrs|
  User.create!(user_attrs) unless User.exists?(email: user_attrs[:email])
end

puts "Seed data created successfully!"
puts "Tenants: #{tenants.join(', ')}"
puts "User emails: #{users.map { |u| u[:email] }.join(', ')}"
