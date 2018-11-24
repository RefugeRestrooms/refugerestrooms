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

  describe '#changing_table?' do
    it { expect(Restroom.new.changing_table?).to be false }
    it { expect(Restroom.new(changing_table: true).changing_table?).to be true }
  end

  describe '.current' do
    it 'should return active listings' do
      create(:restroom, directions: "Most Recent")
      edit = create(:restroom)
      edit.update(approved: false, edit_id: 2)

      restrooms = Restroom.current

      expect(restrooms.size).to eq(1)
      expect(restrooms.first.directions).to eq("Most Recent")
    end

    it 'should return most recent edit approved' do
      restroom = create(:restroom, id: 1, edit_id: 1)
      edit1 = create(:restroom, id: 2, approved: true, directions: "Most Recent")
      edit1.update(edit_id: restroom.id)
      edit2 = create(:restroom, id: 3, directions: "Not approved", approved: false)
      edit2.update(edit_id: restroom.id)

      restrooms = Restroom.current

      expect(restrooms.size).to eq(1)
      expect(restrooms.first.directions).to eq("Most Recent")
    end
  end
end
