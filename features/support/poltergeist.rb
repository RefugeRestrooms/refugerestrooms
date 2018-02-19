require 'capybara/poltergeist'

Capybara.register_driver :poltergeist_debug do |app|
  Capybara::Poltergeist::Driver.new(app, timeout: 60, :inspector => true)
end

Capybara.javascript_driver = :poltergeist_debug
