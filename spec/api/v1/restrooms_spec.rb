require 'spec_helper'

describe "Restrooms API", type: :request do
  it 'sends a list of restrooms order by date descending' do
    create_list(:restroom, 15)

    get '/api/v1/restrooms'
    assert_response :success

    json = JSON.parse(response.body)
    previous_record = nil
    json.each do |rest_json|
      restroom = Restroom.find(rest_json['id'])
      expect(restroom.valid?).to be true
      # TODO: this assertion doesn't seem to ever run
      expect(restroom.created_at).to be >= previous_record.created_at if previous_record.present?
    end
  end

  it 'does not list restroom edits' do
    create(:restroom, id: 1)
    edit = create(:restroom)
    edit.update(approved: false, edit_id: 1)

    get '/api/v1/restrooms'
    expect(response).to be_successful

    json = JSON.parse(response.body)
    expect(json.length).to eq(1)
  end

  it 'paginates list of restrooms by 10 results' do
    create_list(:restroom, 15)

    get '/api/v1/restrooms'
    assert_response :success

    json = JSON.parse(response.body)
    expect(json.length).to eq(10)

    expect(response.header['X-Per-Page']).to eq('10')
    expect(response.header['X-Page']).to eq('1')
    expect(response.header['X-Total-Pages']).to eq('2')
    expect(response.header['X-Total']).to eq('15')
  end

  describe 'filters' do
    before do
      create_list(:restroom, 5)
      create_list(:unisex_restroom, 5)
      create_list(:ada_restroom, 5)
      create_list(:unisex_and_ada_restroom, 5)
    end

    let(:json) { JSON.parse(response.body) }

    context 'when requesting a list of unisex restrooms' do
      before do
        get '/api/v1/restrooms', params: { unisex: true }
      end

      it "is successful" do
        assert_response :success
      end

      it "returns unisex restro3ms" do
        expect(json.select { |restroom| restroom["unisex"] }.count).to eq 10
      end

      it "does not return non-unisex restrooms" do
        expect(json.reject { |restroom| restroom["unisex"] }.count).to eq 0
      end
    end

    context 'when requesting a list of restrooms by ADA availability' do
      before do
        get '/api/v1/restrooms', params: { ada: true }
      end

      it "is successful" do
        assert_response :success
      end

      it "returns accessible restrooms" do
        expect(json.select { |restroom| restroom["accessible"] }.count).to eq 10
      end

      it "does not return non-accessible restrooms" do
        expect(json.reject { |restroom| restroom["accessible"] }.count).to eq 0
      end
    end
  end

  it 'full-text searches a list of restrooms' do
    create(:restroom, name: 'Moonlight Café')
    create(:restroom, name: 'Frankie\'s Coffee Shop')
    create(:restroom, name: 'Hipster Coffee Shop')
    create(:restroom, name: 'Organic Co. Coffee', comment: 'Pretty tile.')

    get '/api/v1/restrooms/search', params: { query: 'Coffee Shop' }
    json = JSON.parse(response.body)
    expect(json.length).to eq(2)
    json.each do
      expect(json[0]['name']).to match(/Coffee Shop/)
    end

    # Tests the full-text unaccent extensions
    get '/api/v1/restrooms/search', params: { query: 'Cafe' }
    json = JSON.parse(response.body)
    expect(json.length).to eq(1)
    expect(json[0]['name']).to eq('Moonlight Café')

    # Tests the full-text searching capability of multiple string attributes
    get '/api/v1/restrooms/search', params: { query: 'Organic pretty tile' }
    json = JSON.parse(response.body)
    expect(json.length).to eq(1)
    expect(json[0]['name']).to eq('Organic Co. Coffee')
  end

  it 'paginates full-text searches a list of restrooms by 10 results' do
    create_list(:restroom, 15)

    get '/api/v1/restrooms/search', params: { query: 'San Francisco' }
    assert_response :success

    json = JSON.parse(response.body)
    expect(json.length).to eq(10)

    expect(response.header['X-Per-Page']).to eq('10')
    expect(response.header['X-Page']).to eq('1')
    expect(response.header['X-Total-Pages']).to eq('2')
    expect(response.header['X-Total']).to eq('15')
  end

  describe "queries" do
    before do
      create(:restroom)
      create(:unisex_restroom, name: 'Frankie\'s Coffee Shop')
      create(:ada_restroom, name: 'Hipster Coffee Shop')
      create(:unisex_and_ada_restroom, name: 'Organic Co. Coffee', comment: 'Pretty tile.')
    end

    let(:json) { JSON.parse(response.body) }

    context 'when looking for unisex restrooms and given a search query' do
      before do
        get '/api/v1/restrooms/search', params: { query: 'Coffee', unisex: true }
      end

      it "is successful" do
        assert_response :success
      end

      it "finds two coffeeshops with unisex restrooms" do
        expect(json.length).to eq(2)
      end

      it "returns accessible restrooms" do
        expect(json.select { |restroom| restroom["unisex"] }.count).to eq 2
      end

      it "does not return non-accessible restrooms" do
        expect(json.reject { |restroom| restroom["unisex"] }.count).to eq 0
      end
    end

    context 'when searching for ADA accessible restrooms and given a search query' do
      before do
        get '/api/v1/restrooms/search', params: { query: 'Coffee', ada: true }
      end

      it "is successful" do
        assert_response :success
      end

      it "finds two coffeeshops with accessible restrooms" do
        expect(json.length).to eq(2)
      end

      it "returns accessible restrooms" do
        expect(json.select { |restroom| restroom["accessible"] }.count).to eq 2
      end

      it "does not return non-accessible restrooms" do
        expect(json.reject { |restroom| restroom["accessible"] }.count).to eq 0
      end
    end

    context "when looking for restrooms by updated date" do
      before do
        create(:restroom, created_at: 1.day.ago)
        params = {
          updated: true,
          day: Time.current.day,
          month: Time.current.month,
          year: Time.current.year
        }
        get "/api/v1/restrooms/by_date", params: params
      end

      it "is successful" do
        assert_response :success
      end

      it "finds all restrooms" do
        expect(json.length).to eq(5)
      end
    end

    context "when filtering by created date" do
      before do
        create(:restroom, created_at: 1.week.ago)
        params = {
          day: Time.current.day,
          month: Time.current.month,
          year: Time.current.year
        }
        get "/api/v1/restrooms/by_date", params: params
      end

      it "is successful" do
        assert_response :success
      end

      it "finds all but one of the restrooms" do
        expect(json.length).to eq(4)
      end
    end
  end
end
