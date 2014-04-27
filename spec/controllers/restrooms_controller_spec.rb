require 'spec_helper'

describe RestroomsController do
  describe "GET index" do
    it "should get index" do
      get :index
      expect(response).to be_success
    end
  end

  describe "GET edit" do
    let(:restroom) { double("Restroom") }

    before :each do
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

  describe "PUT vote" do
    before :each do
      @restroom = double("Restroom", id: 1, errors: {}, model_name: 'Restroom')
      request.env["HTTP_REFERER"] = "http://example.com/restroom/1"
      allow(Restroom).to receive(:find) { @restroom }
    end

    it "should downvote" do
      expect(Restroom).to receive(:increment_counter).with(:downvote, 1)
      put :vote, id: 1, restroom: { downvote: true }
    end

    it "should upvote" do
      expect(Restroom).to receive(:increment_counter).with(:upvote, 1)
      put :vote, id: 1, restroom: { upvote: true }
    end

    it "should redirect back" do
      put :vote, id: 1, restroom: { upvote: true }
      expect(response).to redirect_to("http://example.com/restroom/1")
    end
  end
end
