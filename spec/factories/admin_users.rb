FactoryBot.define do
  factory :admin_user do
    sequence(:email) { |n| "admin#{n}@example.com" }
    sequence(:name) { |n| "Admin User #{n}" }
    password { "password123" }
    password_confirmation { "password123" }
  end
end 