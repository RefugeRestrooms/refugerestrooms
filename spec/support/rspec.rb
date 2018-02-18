require 'capybara/poltergeist'
require 'capybara/rspec'
require 'rspec/rails'
# spec/spec_helper.rb
#

Capybara.register_driver :poltergeist_debug do |app|
  Capybara::Poltergeist::Driver.new(app, :inspector => true)
end
Capybara.javascript_driver = :poltergeist_debug

WebMock.disable_net_connect!(allow_localhost: true)

RSpec.configure do |config|
  config.before(:each) do
    # Akismet response for spam
    stub_request(:post, /.*.rest.akismet.com\/1.1\/comment-check/).
      with(body: /^.*Spam.*$/).
      to_return(status: 200, body: 'true', headers: {})

    # Akismet response for non-spam
    stub_request(:post, /.*.rest.akismet.com\/1.1\/comment-check/).
      with{|request| !request.body.include? "Spam"}.
      to_return(status: 200, body: 'false', headers: {})
  end
end

