FactoryBot.define do
  factory :restroom do
    name { 'The SF LGBT Center' }
    street { '1800 Market St' }
    city { 'San Francisco' }
    state { 'CA' }
    country { 'US' }
    upvote { 22 }
    downvote { 11 }
    comment { 'Comment' }
    directions { 'Direction' }
    approved { true }

    after(:create) do |restroom|
      restroom.update(edit_id: restroom.id)
    end

    trait :geocoded do
      latitude { 37.7749 }
      longitude { -122.4194 }
    end

    trait :unisex do
      unisex { true }
    end

    trait :ada do
      accessible { true }
    end

    trait :comment do
      comment { 'Spacious, single-stall with auto-flushing toilet and ADA railings.' }
    end

    trait :directions do
      directions { 'Near the back, past the counter on the left.' }
    end

    factory :unisex_restroom, traits: [:unisex]
    factory :ada_restroom, traits: [:ada]
    factory :unisex_and_ada_restroom, traits: %i[unisex ada]

    factory :oakland_restroom do
      name { 'Some Cafe' }
      street { '1400 Broadway' }
      city { 'Oakland' }
      state { 'CA' }
      country { 'US' }
    end

    factory :spam_restroom do
      name { 'Spam Cafe' }
      street { 'Spam Street' }
      city { 'Spam City' }
      state { 'Spam State' }
      country { 'Spam Country' }
    end
  end
end
