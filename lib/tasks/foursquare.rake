namespace :db do
  desc "Get hours and pictures from Foursquare"
  task :foursquare => [:environment] do
  	puts "Running foursquare"
  	puts ""

	redis = Redis.new
	# get a foursquare
	client = Foursquare2::Client.new(:client_id => ENV["FOURSQUARE_CLIENT_ID"], :client_secret => ENV["FOURSQUARE_CLIENT_SECRET"], :api_version => '20120505')
  	
	Bathroom.find_each do |bathroom|
  	# get venue id
	venues = client.search_venues(:ll => bathroom.latitude.to_s + "," + bathroom.longitude.to_s, :query => bathroom.name, :limit => 1)
	if !venues.empty? 
	venues_hash = venues.to_hash
	venue = venues_hash["venues"]
	id = venue[0]["id"]

	# get venue hours
	all_hours = client.venue_hours(id)
	all_hours_hash = all_hours.to_hash
	if !all_hours_hash["hours"].empty?
	venue_hours = all_hours_hash["hours"]
	if !venue_hours.empty?
	redis.set(bathroom.name, venue_hours)
	end
	end

	end

end
end
end

