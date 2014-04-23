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
    it "defaults to false" do
      expect(Restroom.new.unisex?).to be false
    end

    it "can be set to true" do
      expect(Restroom.new(unisex: true).unisex?).to be true
    end
  end

  describe '#accessibile?' do
    it "defaults to false" do
      expect(Restroom.new.accessibile?).to be false
    end

    it "can be set to true" do
      expect(Restroom.new(accessibile: true).accessibile?).to be true
    end
  end
end
