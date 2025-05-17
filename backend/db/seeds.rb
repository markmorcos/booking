# Create tenant
tenants = [
  Tenant.create!(path: "me"),
  Tenant.create!(path: "youhanna")
]

# Create users for the tenant
users = [
  {
    tenant: tenants.first,
    email: 'mark.yehia@gmail.com',
    password: ENV['ADMIN_PASSWORD'],
    role: "admin",
    name: "Mark Morcos",
    phone: "+4915145081729",
    confirmed_at: Time.current
  },
  {
    tenant: tenants.last,
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
puts "Tenants: #{tenants.map { |t| t[:path] }.join(', ')}"
puts "User emails: #{users.map { |u| u[:email] }.join(', ')}"
