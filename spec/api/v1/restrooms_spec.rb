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

  context 'filters' do
    before :each do
      FactoryGirl.create_list(:restroom, 5)
      FactoryGirl.create_list(:unisex_restroom, 5)
      FactoryGirl.create_list(:ada_restroom, 5)
      FactoryGirl.create_list(:unisex_and_ada_restroom, 5)
    end

    let(:json) { JSON.parse(response.body) }

    context 'a list of unisex restrooms' do
      before :each do
        get '/api/v1/restrooms', { unisex: true }
      end

      it "is successful" do
        expect(response).to be_success
      end

      it "returns unisex restro3ms" do
        expect(json.select { |restroom| restroom["unisex"] }.count).to eq 10
      end

      it "does not return non-unisex restrooms" do
        expect(json.reject { |restroom| restroom["unisex"] }.count).to eq 0
      end
    end

    context 'a list of restrooms by ADA availability' do
      before :each do
        get '/api/v1/restrooms', { ada: true }
      end

      it "is successful" do
        expect(response).to be_success
      end

      it "returns accessibile restrooms" do
        expect(json.select { |restroom| restroom["accessibile"] }.count).to eq 10
      end

      it "does not return non-accessibile restrooms" do
        expect(json.reject { |restroom| restroom["accessibile"] }.count).to eq 0
      end
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

  context "queries" do
    before :each do
      FactoryGirl.create(:restroom)
      FactoryGirl.create(:unisex_restroom, name: 'Frankie\'s Coffee Shop')
      FactoryGirl.create(:ada_restroom, name: 'Hipster Coffee Shop')
      FactoryGirl.create(:unisex_and_ada_restroom, name: 'Organic Co. Coffee', comment: 'Pretty tile.')
    end

    let(:json) { JSON.parse(response.body) }

    context 'filters a full-text searched list of restrooms by unisex type' do
      before :each do
        get '/api/v1/restrooms/search', { query: 'Coffee', unisex: true }
      end

      it "is successful" do
        expect(response).to be_success
      end

      it "finds two coffeeshops with unisex restrooms" do
        expect(json.length).to eq(2)
      end

      it "returns accessibile restrooms" do
        expect(json.select { |restroom| restroom["unisex"] }.count).to eq 2
      end

      it "does not return non-accessibile restrooms" do
        expect(json.reject { |restroom| restroom["unisex"] }.count).to eq 0
      end
    end

    context 'filters a full-text searched list of restrooms by ADA availability' do
      before :each do
        get '/api/v1/restrooms/search', { query: 'Coffee', ada: true }
      end

      it "is successful" do
        expect(response).to be_success
      end

      it "finds two coffeeshops with accessibile restrooms" do
        expect(json.length).to eq(2)
      end

      it "returns accessibile restrooms" do
        expect(json.select { |restroom| restroom["accessibile"] }.count).to eq 2
      end

      it "does not return non-accessibile restrooms" do
        expect(json.reject { |restroom| restroom["accessibile"] }.count).to eq 0
      end
    end
  end
end
