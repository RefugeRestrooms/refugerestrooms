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

  describe "Voting" do
    before :each do
      request.env["HTTP_REFERER"] = "http://example.com/restroom/1"
      @restroom = double("Restroom", id: 1, errors: {}, model_name: 'Restroom')
      allow(Restroom).to receive(:find) { @restroom }
    end

    describe "POST upvote" do

      before :each do
        allow(@restroom).to receive(:increment!).and_return(true)
      end

      it "should upvote" do
        expect(@restroom).to receive(:increment!).with(:upvote)
        post :upvote, id: 1
      end

      it "should redirect back" do
        post :upvote, id: 1
        expect(response).to redirect_to("http://example.com/restroom/1")
      end

      it "should notify the user they have voted" do
        post :upvote, id: 1
        expect(flash[:notice]).to be_present
      end
    end

    describe "DELETE downvote" do
      before :each do
        allow(@restroom).to receive(:increment!).and_return(true)
      end

      it "should downvote" do
        expect(@restroom).to receive(:increment!).with(:downvote)
        delete :downvote, id: 1
      end

      it "should redirect back" do
        delete :downvote, id: 1
        expect(response).to redirect_to("http://example.com/restroom/1")
      end

      it "should notify the user they have voted" do
        delete :downvote, id: 1
        expect(flash[:notice]).to be_present
      end
    end
  end
end
