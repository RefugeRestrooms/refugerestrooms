require 'test_helper'

describe Bathroom do
  describe '#upvote!' do
    let (:bathroom) { Bathroom.new }

    it 'should increment the number of upvotes by 1' do
      upvotes = bathroom.upvote
      bathroom.upvote!
      bathroom.upvote.must_equal (upvotes + 1)
    end
  end

  describe '#downvote!' do
    let (:bathroom) { Bathroom.new }

    it 'should increment the number of downvotes by 1' do
      downvotes = bathroom.downvote
      bathroom.downvote!
      bathroom.downvote.must_equal (downvotes + 1)
    end
  end

  describe '#rated?' do
    let (:unrated_bathroom) { Bathroom.new }
    let (:rated_bathroom)   { Bathroom.new(upvote: 1) }

    it { unrated_bathroom.rated?.must_equal false }
    it { rated_bathroom.rated?.must_equal true }
  end

  describe '#rating_percentage' do
    it 'should return 0 when there are no votes' do
      Bathroom.new.rating_percentage.must_equal 0
    end

    it 'should return the percentage of upvotes out of total votes' do
      Bathroom.new(upvote: 0, downvote: 1).rating_percentage.must_equal 0
      Bathroom.new(upvote: 1, downvote: 1).rating_percentage.must_equal 50
      Bathroom.new(upvote: 1, downvote: 0).rating_percentage.must_equal 100
    end
  end

  describe '#unisex?' do
    it { Bathroom.new(bath_type: 0).unisex?.must_equal true }
    it { Bathroom.new(bath_type: 1).unisex?.must_equal false }
  end

  describe '#accessible?' do
    it { Bathroom.new(access: 0).accessible?.must_equal false }
    it { Bathroom.new(access: 1).accessible?.must_equal true }
  end
end
