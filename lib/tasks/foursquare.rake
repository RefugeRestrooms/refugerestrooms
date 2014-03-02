namespace :db do
  desc "Get hours and pictures from Foursquare"
  task :foursquare => [:environment] do
  	puts "Running foursquare"
  	puts ""

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
	hours = client.venue_hours(id)
	hours_hash = hours.to_hash
	if hours_hash["hours"].empty?
	all_timeframes = hours_hash["popular"]
	else all_timeframes = hours_hash["hours"]
	end
	puts all_timeframes

	# cache the result 
  	# Rails.cache.write(bathroom.name + "hours", hours_hash)
end
end
end
end

