require 'spec_helper'

describe SaveRestroom do
  it 'saves a restroom' do
    restroom = build(:restroom, id: 1)

    actual_restroom = described_class.new(restroom).call

    expect(Restroom.all.size).to eq(1)
    expect(actual_restroom.id).to eq(1)
    expect(actual_restroom.edit_id).to eq(1)
    expect(actual_restroom.approved?).to eq(true)
  end

  it 'creates an error for spam' do
    restroom = build(:spam_restroom)

    actual_restroom = described_class.new(restroom).call

    expect(Restroom.all.size).to eq(0)
    expect(actual_restroom.errors.key?(:spam)).to be true
  end

  it "updates the edit id and approved" do
    restroom = build(:restroom)
    restroom.edit_id = 1
    restroom.approved = false

    actual_restroom = described_class.new(restroom).call

    expect(Restroom.all.size).to eq(1)
    expect(actual_restroom.edit_id).to eq(1)
    expect(actual_restroom.approved?).to eq(false)
  end
end
