FactoryBot.define do
  factory :appointment do
    association :availability_slot
    sequence(:name) { |n| "Test User #{n}" }
    sequence(:email) { |n| "user#{n}@example.com" }
    phone { "+1234567890" }
    notes { "Looking forward to the meeting" }
    status { 0 } # pending by default

    trait :confirmed do
      status { 1 }
    end

    trait :cancelled do
      status { 2 }
    end
  end
end 