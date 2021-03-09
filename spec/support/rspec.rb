require 'capybara/poltergeist'
require 'capybara/rspec'
require 'rspec/rails'
require 'json'
# spec/spec_helper.rb
#

require_relative './locations'

Capybara.register_driver :poltergeist_debug do |app|
  Capybara::Poltergeist::Driver.new(
    app,
    js_errors: false
  )
end

Capybara.javascript_driver = :poltergeist_debug

WebMock.disable_net_connect!(allow_localhost: true)

RSpec.configure do |config|
  config.include Locations

  config.before do
    stub_request(:get, "http://maps.googleapis.com/maps/api/geocode/json?language=en&latlng=37.8044,-122.2708")
      .with(
        headers: {
          'Accept' => '*/*',
          'Accept-Encoding' => 'gzip;q=1.0,deflate;q=0.6,identity;q=0.3',
          'User-Agent' => 'Ruby'
        }
      )
      .to_return(status: 200, body: File.new(Rails.root.join('spec/fixtures/guess_in_oakland.json')), headers: {})

    recaptcha_response = { 'success' => true }
    stub_request(:post, 'https://www.google.com/recaptcha/api/siteverify')
      .to_return(status: 200, body: recaptcha_response.to_json,
                 headers: { 'Content-Type' => 'application/json' })

    # Akismet response for spam
    stub_request(:post, /.*.rest.akismet.com\/1.1\/comment-check/)
      .with(body: /^.*Spam.*$/)
      .to_return(status: 200, body: 'true', headers: {})

    # Akismet response for non-spam
    stub_request(:post, /.*.rest.akismet.com\/1.1\/comment-check/)
      .with { |request| request.body.exclude? "Spam" }
      .to_return(status: 200, body: 'false', headers: {})
  end
end
