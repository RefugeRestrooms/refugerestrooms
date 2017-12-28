require Rails.root.join('lib', 'yelp_client')
class Restroom::Yelp
  class << self
    def near(lat, lng)
      conn = Faraday.new(:url => "https://api.yelp.com/v3/businesses/search?latitude=#{lat}&longitude=#{lng}&attributes=gender_neutral_restrooms")
      results = conn.get do |req|
        req.headers['Authorization'] = "Bearer #{Rails.application.secrets.yelp_access_token}"
      end

      businesses = JSON.parse(results.body)['businesses']
      businesses.map do |business|
        restroom_from_business(business)
      end.compact
    end

    private

    def restroom_from_business(business)
        Restroom.new(
          name: business["name"],
          street: business["location"]["address1"],
          city: business["location"]["city"],
          state: business["location"]["state"],
          latitude: business["coordinates"]["latitude"],
          longitude: business["coordinates"]["longitude"],
          country: business["location"]["country"]
        )
    rescue => e
      Rails.logger.error("Could not map yelp business: #{e.message}")
      nil
    end
  end
end
