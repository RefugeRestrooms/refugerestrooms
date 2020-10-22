require 'spec_helper'

describe PagesController, type: :controller do
  it "#index" do
    get :index
    assert_response :success
  end

  it "#about"  do
    get :show, params: { id: 'about' }
    assert_response :success
  end

  it "#signs"  do
    get :show, params: { id: 'signs' }
    assert_response :success
  end

  it "#text" do
    get :show, params: { id: 'text' }
    assert_response :success
  end
end
