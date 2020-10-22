require 'spec_helper'

describe Restroom do
  let(:restroom) { described_class.new }

  describe '#rated?' do
    let(:unrated_restroom) { described_class.new }
    let(:rated_restroom)   { described_class.new(upvote: 1) }

    specify { expect(rated_restroom).to be_rated }
    specify { expect(unrated_restroom).not_to be_rated }
  end

  describe '#rating_percentage' do
    it 'returns 0 when there are no votes' do
      expect(restroom.rating_percentage).to eq 0
    end

    it "returns zero if there are no upvotes" do
      expect(described_class.new(upvote: 0, downvote: 1).rating_percentage).to eq 0
    end

    it "returns 50% if upvotes equal downvotes" do
      expect(described_class.new(upvote: 1, downvote: 1).rating_percentage).to eq 50
    end

    it "returns 100% if there are upvotes and no downvotes" do
      expect(described_class.new(upvote: 1, downvote: 0).rating_percentage).to eq 100
    end
  end

  describe '#unisex?' do
    it { expect(described_class.new.unisex?).to be false }
    it { expect(described_class.new(unisex: true).unisex?).to be true }
  end

  describe '#accessible?' do
    it { expect(described_class.new.accessible?).to be false }
    it { expect(described_class.new(accessible: true).accessible?).to be true }
  end

  describe '#changing_table?' do
    it { expect(described_class.new.changing_table?).to be false }
    it { expect(described_class.new(changing_table: true).changing_table?).to be true }
  end

  describe '.current' do
    it 'returns active listings' do
      create(:restroom, directions: "Most Recent")
      edit = create(:restroom)
      edit.update(approved: false, edit_id: 2)

      restrooms = described_class.current

      expect(restrooms.size).to eq(1)
      expect(restrooms.first.directions).to eq("Most Recent")
    end

    it 'returns most recent edit approved' do
      restroom = create(:restroom, id: 1, edit_id: 1)
      edit1 = create(:restroom, id: 2, approved: true, directions: "Most Recent")
      edit1.update(edit_id: restroom.id)
      edit2 = create(:restroom, id: 3, directions: "Not approved", approved: false)
      edit2.update(edit_id: restroom.id)

      restrooms = described_class.current

      expect(restrooms.size).to eq(1)
      expect(restrooms.first.directions).to eq("Most Recent")
    end
  end
end
