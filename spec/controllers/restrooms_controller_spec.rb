require 'spec_helper'

describe RestroomsController do
  describe "GET index" do
    it "should get index" do
      get :index
      expect(response).to be_success
    end
  end

  describe "GET edit" do
    before :each do
      @restroom = double("Restroom")
      allow(Restroom).to receive(:find) { @restroom }
    end

    it "should get index" do
      get :edit, id: 1
      expect(response).to be_success
    end

    it "should assign @restroom" do
      get :edit, id: 1
      expect(assigns(:restroom)).to eq(@restroom)
    end
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
