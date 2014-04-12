require 'spec_helper'

describe BathroomsController do
  it "should get index" do
    get :index
    expect(response).to be_success
  end
end
