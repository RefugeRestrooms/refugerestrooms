require 'spec_helper'

describe RestroomsController, type: :controller do
  it "should get index" do
    get :index
    assert_response :success
  end

  context "voting" do
    let(:restroom) { FactoryBot.create(:restroom) }

    it "should downvote" do
      post_params = {
        id: restroom.id,
        restroom: {
          downvote: true
        }
      }

      expect {
        post :update, params: post_params
      }.to change { restroom.reload.downvote }.by 1
    end

    it "should upvote" do
      post_params = {
        id: restroom.id,
        restroom: {
          upvote: true
        }
      }

      expect {
        post :update, params: post_params
      }.to change { restroom.reload.upvote }.by 1
    end
  end
end
