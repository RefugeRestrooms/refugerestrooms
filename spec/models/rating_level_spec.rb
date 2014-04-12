require 'spec_helper'

describe RatingLevel do
  describe '.for_bathroom' do
    it 'returns green level for bathrooms with a rating higher than 70%' do
      bathroom = Bathroom.new upvote: 71, downvote: 29
      expect(RatingLevel.for_bathroom(bathroom)).to eq RatingLevel.green
    end

    it 'returns red level for bathrooms with a rating up to 50%' do
      bathroom = Bathroom.new upvote: 50, downvote: 50
      expect(RatingLevel.for_bathroom(bathroom)).to eq RatingLevel.red
    end

    it 'returns yellow level for bathrooms with a rating of 51%' do
      bathroom = Bathroom.new upvote: 51, downvote: 49
      expect(RatingLevel.for_bathroom(bathroom)).to eq RatingLevel.yellow
    end

    it 'returns yellow level for bathrooms with a rating of 70%' do
      bathroom = Bathroom.new upvote: 70, downvote: 30
      expect(RatingLevel.for_bathroom(bathroom)).to eq RatingLevel.yellow
    end
  end
end
