require 'webmock/cucumber'
WebMock.disable_net_connect!(allow_localhost: true)

Before do |scenario|
  # guess in Oakland
  stub_request(:get, "http://maps.googleapis.com/maps/api/geocode/json?language=en&latlng=37.8044,-122.2708").
    with(:headers => {'Accept'=>'*/*', 'Accept-Encoding'=>'gzip;q=1.0,deflate;q=0.6,identity;q=0.3', 'User-Agent'=>'Ruby'}).
    to_return(:status => 200, :body => File.new("#{Rails.root}/spec/fixtures/guess_in_oakland.json"), :headers => {})

  # guess in Winnipeg
  stub_request(:get, "http://maps.googleapis.com/maps/api/geocode/json?language=en&latlng=49.8975494,-97.140118").
    with(:headers => {'Accept'=>'*/*', 'Accept-Encoding'=>'gzip;q=1.0,deflate;q=0.6,identity;q=0.3', 'User-Agent'=>'Ruby'}).
    to_return(:status => 200, :body => File.new("#{Rails.root}/spec/fixtures/guess_in_winnipeg.json"), :headers => {})

  # guess in Vancouver
  stub_request(:get, "http://maps.googleapis.com/maps/api/geocode/json?language=en&latlng=49.281006,-123.089959").
    with(:headers => {'Accept'=>'*/*', 'Accept-Encoding'=>'gzip;q=1.0,deflate;q=0.6,identity;q=0.3', 'User-Agent'=>'Ruby'}).
    to_return(:status => 200, :body => File.new("#{Rails.root}/spec/fixtures/guess_in_vancouver.json"), :headers => {})

  # Akismet response for spam
  stub_request(:post, /.*.rest.akismet.com\/1.1\/comment-check/).
    with(body: /^.*Spam.*$/).
    to_return(status: 200, body: 'true', headers: {})

  # Akismet response for non-spam
  stub_request(:post, /.*.rest.akismet.com\/1.1\/comment-check/).
    with{|request| !request.body.include? "Spam"}.
    to_return(status: 200, body: 'false', headers: {})
end
