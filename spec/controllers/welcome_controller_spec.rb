require 'spec_helper'

describe WelcomeController, type: :controller  do
  it "should get index" do
    get :index
    expect(response).to be_success
  end

  it "#about"  do
    get :about
    expect(response).to be_success
  end

  it "#signs"  do
    get :signs
    expect(response).to be_success
  end

  it "#text_msg" do
    get :text_msg
    expect(response).to be_success
  end
end
