require 'spec_helper'

describe RatingLevel do
  describe '.for_restroom' do
    it 'returns green level for restrooms with a rating higher than 70%' do
      restroom = Restroom.new upvote: 71, downvote: 29
      expect(RatingLevel.for_restroom(restroom)).to eq RatingLevel.green
    end

    it 'returns red level for restrooms with a rating up to 50%' do
      restroom = Restroom.new upvote: 50, downvote: 50
      expect(RatingLevel.for_restroom(restroom)).to eq RatingLevel.red
    end

    it 'returns yellow level for restrooms with a rating of 51%' do
      restroom = Restroom.new upvote: 51, downvote: 49
      expect(RatingLevel.for_restroom(restroom)).to eq RatingLevel.yellow
    end

    it 'returns yellow level for restrooms with a rating of 70%' do
      restroom = Restroom.new upvote: 70, downvote: 30
      expect(RatingLevel.for_restroom(restroom)).to eq RatingLevel.yellow
    end
  end
end
