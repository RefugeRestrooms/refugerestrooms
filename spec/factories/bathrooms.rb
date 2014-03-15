FactoryGirl.define do
  factory :bathroom do
    name 'Moonlight Café'
    street '123 Example St.'
    city 'San Francisco'
    state 'CA'
    country 'US'
    bath_type 0
    access 0

    trait :unisex do
      bath_type 1
    end
    
    trait :ada do
      access 1
    end

    trait :comment do
      comment 'Spacious, single-stall with auto-flushing toilet and ADA railings.'
    end
    
    trait :directions do
      directions 'Near the back, past the counter on the left.'
    end

    factory :unisex_bathroom, traits: [:unisex]
    factory :ada_bathroom, traits: [:ada]
    factory :unisex_and_ada_bathroom, traits: [:unisex, :ada]
  end
end
