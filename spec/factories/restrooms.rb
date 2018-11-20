FactoryBot.define do
  factory :restroom do
    name 'Moonlight Café'
    street '123 Example St.'
    city 'San Francisco'
    state 'CA'
    country 'US'
    upvote 22
    downvote 11

    trait :geocoded do
      latitude 37.7749
      longitude -122.4194
    end

    trait :unisex do
      unisex true
    end

    trait :ada do
      accessible true
    end

    trait :comment do
      comment 'Spacious, single-stall with auto-flushing toilet and ADA railings.'
    end

    trait :directions do
      directions 'Near the back, past the counter on the left.'
    end

    factory :unisex_restroom, traits: [:unisex]
    factory :ada_restroom, traits: [:ada]
    factory :unisex_and_ada_restroom, traits: [:unisex, :ada]

    factory :oakland_restroom do
      name 'Some Cafe'
      street '1400 Broadway'
      city 'Oakland'
      state 'CA'
      country 'US'
    end
  end
end
