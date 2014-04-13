require 'spec_helper'

describe 'Restrooms API' do
  it 'sends a list of restrooms order by date descending' do
    FactoryGirl.create_list(:restroom, 15)

    get '/api/v1/restrooms'
    expect(response).to be_success

    json = JSON.parse(response.body)
    previous_record = nil
    json.each do |rest_json|
      restroom = Restroom.find(rest_json['id'])
      expect(restroom.valid?).to be true
      if previous_record.present?
        expect(restroom.created_at).to be >= previous_record.created_at
      end
    end
  end

  it 'paginates list of restrooms by 10 results' do
    FactoryGirl.create_list(:restroom, 15)

    get '/api/v1/restrooms'
    expect(response).to be_success

    json = JSON.parse(response.body)
    expect(json.length).to eq(10)

    expect(response.header['X-Per-Page']).to eq('10')
    expect(response.header['X-Page']).to eq('1')
    expect(response.header['X-Total-Pages']).to eq('2')
    expect(response.header['X-Total']).to eq('15')
  end

  it 'filters a list of restrooms by unisex type' do
    FactoryGirl.create_list(:restroom, 5)
    FactoryGirl.create_list(:unisex_restroom, 5)
    FactoryGirl.create_list(:ada_restroom, 5)
    FactoryGirl.create_list(:unisex_and_ada_restroom, 5)

    get '/api/v1/restrooms', { unisex: true }
    expect(response).to be_success

    json = JSON.parse(response.body)
    expect(json.length).to eq(5 + 5)
    json.each do |restroom|
      expect(restroom['bath_type']).to be_truthy
    end
  end

  it 'filters a list of restrooms by ADA availability' do
    FactoryGirl.create_list(:restroom, 5)
    FactoryGirl.create_list(:unisex_restroom, 5)
    FactoryGirl.create_list(:ada_restroom, 5)
    FactoryGirl.create_list(:unisex_and_ada_restroom, 5)

    get '/api/v1/restrooms', { ada: true }
    expect(response).to be_success

    json = JSON.parse(response.body)
    expect(json.length).to eq(5 + 5)
    json.each do |restroom|
      expect(restroom['access']).to be_truthy
    end
  end

  it 'full-text searches a list of restrooms' do
    FactoryGirl.create(:restroom)
    FactoryGirl.create(:restroom, name: 'Frankie\'s Coffee Shop')
    FactoryGirl.create(:restroom, name: 'Hipster Coffee Shop')
    FactoryGirl.create(:restroom, name: 'Organic Co. Coffee', comment: 'Pretty tile.')

    get '/api/v1/restrooms/search', { query: 'Coffee Shop' }
    json = JSON.parse(response.body)
    expect(json.length).to eq(2)
    json.each do |restroom|
      expect(json[0]['name']).to match(/Coffee Shop/)
    end

    # Tests the full-text unaccent extensions
    get '/api/v1/restrooms/search', { query: 'Cafe' }
    json = JSON.parse(response.body)
    expect(json.length).to eq(1)
    expect(json[0]['name']).to eq('Moonlight Café')

    # Tests the full-text searching capability of multiple string attributes
    get '/api/v1/restrooms/search', { query: 'Organic pretty tile' }
    json = JSON.parse(response.body)
    expect(json.length).to eq(1)
    expect(json[0]['name']).to eq('Organic Co. Coffee')
  end

  it 'paginates full-text searches a list of restrooms by 10 results' do
    FactoryGirl.create_list(:restroom, 15)

    get '/api/v1/restrooms/search', { query: 'San Francisco' }
    expect(response).to be_success

    json = JSON.parse(response.body)
    expect(json.length).to eq(10)

    expect(response.header['X-Per-Page']).to eq('10')
    expect(response.header['X-Page']).to eq('1')
    expect(response.header['X-Total-Pages']).to eq('2')
    expect(response.header['X-Total']).to eq('15')
  end

  it 'filters a full-text searched list of restrooms by unisex type' do
    FactoryGirl.create(:restroom)
    FactoryGirl.create(:unisex_restroom, name: 'Frankie\'s Coffee Shop')
    FactoryGirl.create(:ada_restroom, name: 'Hipster Coffee Shop')
    FactoryGirl.create(:unisex_and_ada_restroom, name: 'Organic Co. Coffee', comment: 'Pretty tile.')

    get '/api/v1/restrooms/search', { query: 'Coffee', unisex: true }
    expect(response).to be_success

    json = JSON.parse(response.body)
    expect(json.length).to eq(2)
    json.each do |restroom|
      expect(restroom['bath_type']).to be_truthy
    end
  end

  it 'filters a full-text searched list of restrooms by ADA availability' do
    FactoryGirl.create(:restroom)
    FactoryGirl.create(:unisex_restroom, name: 'Frankie\'s Coffee Shop')
    FactoryGirl.create(:ada_restroom, name: 'Hipster Coffee Shop')
    FactoryGirl.create(:unisex_and_ada_restroom, name: 'Organic Co. Coffee', comment: 'Pretty tile.')

    get '/api/v1/restrooms/search', { query: 'Coffee', ada: true }
    expect(response).to be_success

    json = JSON.parse(response.body)
    expect(json.length).to eq(2)
    json.each do |restroom|
      expect(restroom['access']).to be_truthy
    end
  end
end
