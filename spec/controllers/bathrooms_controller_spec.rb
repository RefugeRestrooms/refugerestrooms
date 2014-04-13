require 'spec_helper'

describe BathroomsController do
  it "should get index" do
    get :index
    expect(response).to be_success
  end

  context "voting" do
    let(:bathroom) { FactoryGirl.create(:bathroom) }

    it "should downvote" do
      expect {
        post :update, id: bathroom.id, bathroom: { downvote: true }
      }.to change { bathroom.reload.downvote }.by 1
    end

    it "should upvote" do
      expect {
        post :update, id: bathroom.id, bathroom: { upvote: true }
      }.to change { bathroom.reload.upvote }.by 1
    end
  end
end
