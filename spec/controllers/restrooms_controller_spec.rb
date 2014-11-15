require 'spec_helper'

describe RestroomsController, type: :controller do
  it "should get index" do
    get :index
    expect(response).to be_success
  end

  context "voting" do
    let(:restroom) { FactoryGirl.create(:restroom) }

    it "should downvote" do
      expect {
        post :update, id: restroom.id, restroom: { downvote: true }
      }.to change { restroom.reload.downvote }.by 1
    end

    it "should upvote" do
      expect {
        post :update, id: restroom.id, restroom: { upvote: true }
      }.to change { restroom.reload.upvote }.by 1
    end
  end
end
