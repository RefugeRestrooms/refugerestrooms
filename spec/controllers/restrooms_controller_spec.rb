require 'spec_helper'

describe RestroomsController, type: :controller do
  it "#index" do
    get :index
    assert_response :success
  end

  describe "voting" do
    let(:restroom) { FactoryBot.create(:restroom) }

    it "can downvote" do
      post_params = {
        id: restroom.id,
        restroom: {
          downvote: true
        }
      }

      expect do
        post :update, params: post_params
      end.to change { restroom.reload.downvote }.by 1
    end

    it "can upvote" do
      post_params = {
        id: restroom.id,
        restroom: {
          upvote: true
        }
      }

      expect do
        post :update, params: post_params
      end.to change { restroom.reload.upvote }.by 1
    end
  end
end
