require 'spec_helper'

describe 'Bathrooms API' do
  it 'sends a list of bathrooms order by date descending' do
    FactoryGirl.create_list(:bathroom, 15)

    get '/api/v1/bathrooms'
    expect(response).to be_success

    json = JSON.parse(response.body)
    previous_record = nil
    json.each do |bath_json|
      bathroom = Bathroom.find(bath_json['id'])
      expect(bathroom.valid?).to be true
      if previous_record.present?
        expect(bathroom.created_at).to be >= previous_record.created_at
      end
    end
  end

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

  it 'filters a list of bathrooms by unisex type' do
    FactoryGirl.create_list(:bathroom, 5)
    FactoryGirl.create_list(:unisex_bathroom, 5)
    FactoryGirl.create_list(:ada_bathroom, 5)
    FactoryGirl.create_list(:unisex_and_ada_bathroom, 5)

    get '/api/v1/bathrooms', { unisex: true }
    expect(response).to be_success

    json = JSON.parse(response.body)
    expect(json.length).to eq(5 + 5)
    json.each do |bathroom|
      expect(bathroom['bath_type']).to be_truthy
    end
  end

  it 'filters a list of bathrooms by ADA availability' do
    FactoryGirl.create_list(:bathroom, 5)
    FactoryGirl.create_list(:unisex_bathroom, 5)
    FactoryGirl.create_list(:ada_bathroom, 5)
    FactoryGirl.create_list(:unisex_and_ada_bathroom, 5)

    get '/api/v1/bathrooms', { ada: true }
    expect(response).to be_success

    json = JSON.parse(response.body)
    expect(json.length).to eq(5 + 5)
    json.each do |bathroom|
      expect(bathroom['access']).to be_truthy
    end
  end

  it 'full-text searches a list of bathrooms' do
    FactoryGirl.create(:bathroom)
    FactoryGirl.create(:bathroom, name: 'Frankie\'s Coffee Shop')
    FactoryGirl.create(:bathroom, name: 'Hipster Coffee Shop')
    FactoryGirl.create(:bathroom, name: 'Organic Co. Coffee', comment: 'Pretty tile.')

    get '/api/v1/bathrooms/search', { query: 'Coffee Shop' }
    json = JSON.parse(response.body)
    expect(json.length).to eq(2)
    json.each do |bathroom|
      expect(json[0]['name']).to match(/Coffee Shop/)
    end

    # Tests the full-text unaccent extensions
    get '/api/v1/bathrooms/search', { query: 'Cafe' }
    json = JSON.parse(response.body)
    expect(json.length).to eq(1)
    expect(json[0]['name']).to eq('Moonlight Café')

    # Tests the full-text searching capability of multiple string attributes
    get '/api/v1/bathrooms/search', { query: 'Organic pretty tile' }
    json = JSON.parse(response.body)
    expect(json.length).to eq(1)
    expect(json[0]['name']).to eq('Organic Co. Coffee')
  end

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

  it 'filters a full-text searched list of bathrooms by unisex type' do
    FactoryGirl.create(:bathroom)
    FactoryGirl.create(:unisex_bathroom, name: 'Frankie\'s Coffee Shop')
    FactoryGirl.create(:ada_bathroom, name: 'Hipster Coffee Shop')
    FactoryGirl.create(:unisex_and_ada_bathroom, name: 'Organic Co. Coffee', comment: 'Pretty tile.')

    get '/api/v1/bathrooms/search', { query: 'Coffee', unisex: true }
    expect(response).to be_success

    json = JSON.parse(response.body)
    expect(json.length).to eq(2)
    json.each do |bathroom|
      expect(bathroom['bath_type']).to be_truthy
    end
  end

  it 'filters a full-text searched list of bathrooms by ADA availability' do
    FactoryGirl.create(:bathroom)
    FactoryGirl.create(:unisex_bathroom, name: 'Frankie\'s Coffee Shop')
    FactoryGirl.create(:ada_bathroom, name: 'Hipster Coffee Shop')
    FactoryGirl.create(:unisex_and_ada_bathroom, name: 'Organic Co. Coffee', comment: 'Pretty tile.')

    get '/api/v1/bathrooms/search', { query: 'Coffee', ada: true }
    expect(response).to be_success

    json = JSON.parse(response.body)
    expect(json.length).to eq(2)
    json.each do |bathroom|
      expect(bathroom['access']).to be_truthy
    end
  end
end
