source 'https://rubygems.org'
ruby '2.3.1'

gem 'rails', '5.1.4'
gem 'pg'
gem 'pg_search'
gem 'sass-rails'
gem 'bootstrap-sass'
gem 'haml'
gem 'rails_12factor'
gem 'uglifier', '>= 1.3.0'
gem 'coffee-rails', '~> 4.2'
gem 'jquery-rails'
gem 'turbolinks'
gem 'jbuilder', '~> 2.5'
gem 'piwik_analytics', '~> 1.0.2'
gem 'geocoder', '~> 1.2.1'
gem 'devise', '~> 4.0'
gem 'rakismet'
gem 'country_select'
gem 'mail_form', '>= 1.7.0'
gem 'simple_form', '~> 3.5'
gem 'grape', '0.7.0'
gem 'grape-swagger', '~> 0.7.2'
gem 'grape-kaminari'
gem 'kaminari'
gem 'high_voltage', '~> 3.0.0'
gem 'bugsnag'
gem 'rack-cors', :require => 'rack/cors'
gem 'rack-jsonp'

# Upgraded to 1.0.0 for Rails 5.1.4
gem 'activeadmin', '~> 1.0.0'

group :development, :test do
  gem 'rspec-rails'
  gem "factory_girl_rails", "~> 4.0"
  gem 'dotenv-rails'
  gem 'pry'
  gem 'better_errors'
  gem 'binding_of_caller'
end

group :test do
  gem 'rake'
  gem 'cucumber-rails', '~> 1.4.5', require: false
  gem 'database_cleaner'
  gem 'simplecov', '~> 0.7.1', require: false
  gem 'poltergeist'
  gem 'webmock', '~> 1.18.0'
end

group :doc do
  gem 'sdoc', require: false
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]
