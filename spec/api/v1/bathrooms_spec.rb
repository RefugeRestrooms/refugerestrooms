require 'spec_helper'

describe 'Bathrooms API' do
  it 'sends a list of bathrooms'

  it 'paginates list of bathrooms by 10 results' do
     FactoryGirl.create_list(:bathroom, 15)

     get '/api/v1/bathrooms'
     expect(response).to be_success

     json = JSON.parse(response.body)
     expect(json.length).to eq(10)

     expect(response.header['X-Per-Page']).to eq('10')
     expect(response.header['X-Page']).to eq('1')
     expect(response.header['X-Total-Pages']).to eq('2')
     expect(response.header['X-Total']).to eq('15')
  end

  it 'filters a list of bathrooms by unisex type'
  it 'filters a list of bathrooms by ADA availability'

  it 'full-text searches a list of bathrooms'

  it 'paginates full-text searches a list of bathrooms by 10 results' do
     FactoryGirl.create_list(:bathroom, 15)

     get '/api/v1/bathrooms/search', { query: 'San Francisco' }
     expect(response).to be_success

     json = JSON.parse(response.body)
     expect(json.length).to eq(10)

     expect(response.header['X-Per-Page']).to eq('10')
     expect(response.header['X-Page']).to eq('1')
     expect(response.header['X-Total-Pages']).to eq('2')
     expect(response.header['X-Total']).to eq('15')
  end

  it 'filters a full-text searched list of bathrooms by unisex type'
  it 'filters a full-text searched list of bathrooms by ADA availability'
end
