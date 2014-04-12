require 'spec_helper'

describe Bathroom do
  let (:bathroom) { Bathroom.new }
  describe '#upvote!' do

    it 'should increment the number of upvotes by 1' do
      expect { bathroom.upvote! }.to change { bathroom.upvote }.by 1
    end
  end

  describe '#downvote!' do
    it 'should increment the number of downvotes by 1' do
      expect { bathroom.downvote! }.to change { bathroom.downvote }.by 1
    end
  end

  describe '#rated?' do
    let (:unrated_bathroom) { Bathroom.new }
    let (:rated_bathroom)   { Bathroom.new(upvote: 1) }

    specify { expect(rated_bathroom.rated?).to be_truthy }
    specify { expect(unrated_bathroom.rated?).to be_falsey }
  end

  describe '#rating_percentage' do
    context 'it returns the rating percentage' do
      it 'should return 0 when there are no votes' do
        expect(bathroom.rating_percentage).to eq 0
      end

      it "should return zero if there are no upvotes" do
        expect(Bathroom.new(upvote: 0, downvote: 1).rating_percentage).to eq 0
      end

      it "should return 50% if upvotes equal downvotes" do
        expect(Bathroom.new(upvote: 1, downvote: 1).rating_percentage).to eq 50
      end

      it "should return 100% if there are upvotes and no downvotes" do
        expect(Bathroom.new(upvote: 1, downvote: 0).rating_percentage).to eq 100
      end
    end
  end

  describe '#unisex?' do
    it { expect(Bathroom.new(bath_type: 0).unisex?).to be true }
    it { expect(Bathroom.new(bath_type: 1).unisex?).to be false }
  end

  describe '#accessible?' do
    it { expect(Bathroom.new(access: 0).accessible?).to be false }
    it { expect(Bathroom.new(access: 1).accessible?).to be true }
  end
end
