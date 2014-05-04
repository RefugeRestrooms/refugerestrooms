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
      request.env["HTTP_REFERER"] = "http://example.com/restroom/1"
      @restroom = double("Restroom", id: 1, errors: {}, model_name: 'Restroom')
      allow(Restroom).to receive(:find) { @restroom }
    end

    context "with valid params" do
      before :each do
        allow(@restroom).to receive(:increment!).and_return(true)
      end

      it "should downvote" do
        expect(@restroom).to receive(:increment!).with(:downvote)
        put :vote, id: 1, restroom: { downvote: true }
      end

      it "should upvote" do
        expect(@restroom).to receive(:increment!).with(:upvote)
        put :vote, id: 1, restroom: { upvote: true }
      end

      it "should redirect back" do
        put :vote, id: 1, restroom: { upvote: true }
        expect(response).to redirect_to("http://example.com/restroom/1")
      end

      it "should notify the user they have voted" do
        put :vote, id: 1, restroom: { upvote: true }
        expect(flash[:notice]).to eq("This restroom has been upvoted! Thank you for contributing to our community.")
      end
    end

    context "without valid params" do
      it "should raise an exception" do
        expect { put :vote, id: 1, restroom: {} }.to raise_error(ArgumentError)
      end
    end
  end
end
