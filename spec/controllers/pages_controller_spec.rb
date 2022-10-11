require 'spec_helper'

describe PagesController, type: :controller do
  it_behaves_like 'localized request', :index

  it "#index" do
    get :index
    expect(response).to have_http_status(:success)
  end

  it "#about"  do
    get :show, params: { id: 'about' }
    expect(response).to have_http_status(:success)
  end

  it "#signs"  do
    get :show, params: { id: 'signs' }
    expect(response).to have_http_status(:success)
  end

  it "#text" do
    get :show, params: { id: 'text' }
    expect(response).to have_http_status(:success)
  end
end
