FactoryBot.define do
  factory :availability_slot do
    start_time { Time.current + 1.day }
    end_time { Time.current + 1.day + 1.hour }
  end
end 