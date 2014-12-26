require 'spec_helper'

describe Restroom do
  let (:restroom) { Restroom.new }

  describe '#rated?' do
    let (:unrated_restroom) { Restroom.new }
    let (:rated_restroom)   { Restroom.new(upvote: 1) }

    specify { expect(rated_restroom.rated?).to be_truthy }
    specify { expect(unrated_restroom.rated?).to be_falsey }
  end

  describe '#rating_percentage' do
    context 'it returns the rating percentage' do
      it 'should return 0 when there are no votes' do
        expect(restroom.rating_percentage).to eq 0
      end

      it "should return zero if there are no upvotes" do
        expect(Restroom.new(upvote: 0, downvote: 1).rating_percentage).to eq 0
      end

      it "should return 50% if upvotes equal downvotes" do
        expect(Restroom.new(upvote: 1, downvote: 1).rating_percentage).to eq 50
      end

      it "should return 100% if there are upvotes and no downvotes" do
        expect(Restroom.new(upvote: 1, downvote: 0).rating_percentage).to eq 100
      end
    end
  end

  describe '#unisex?' do
    it { expect(Restroom.new.unisex?).to be false }
    it { expect(Restroom.new(unisex: true).unisex?).to be true }
  end

  describe '#accessible?' do
    it { expect(Restroom.new.accessible?).to be false }
    it { expect(Restroom.new(accessible: true).accessible?).to be true }
  end

  describe '#topcities' do
    it 'should return the top five cities with the most restroom data' do
      city_with_more_data = "City1"
      2.times do
        FactoryGirl.create(:restroom, city: city_with_more_data)
        FactoryGirl.create(:restroom, city: "City2")
        FactoryGirl.create(:restroom, city: "City3")
        FactoryGirl.create(:restroom, city: "City4")
        FactoryGirl.create(:restroom, city: "City5")
      end

      bathroom_in_city_with_less_data = FactoryGirl.create(:restroom, city: "City6")

      cities = Restroom.topcities
      expect(cities.count).to be 5
      expect(cities).not_to include(bathroom_in_city_with_less_data.city)
      expect(cities).to include(city_with_more_data)
    end
  end
end
