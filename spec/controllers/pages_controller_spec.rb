require 'spec_helper'

describe PagesController, type: :controller  do
  it "should get index" do
    get :index
    expect(response).to be_success
  end

  it "#about"  do
    get :show, params: { id: 'about' }
    expect(response).to be_success
  end

  it "#signs"  do
    get :show, params: { id: 'signs' }
    expect(response).to be_success
  end

  it "#text" do
    get :show, params: { id: 'text' }
    expect(response).to be_success
  end
end
