source 'https://rubygems.org'
ruby '2.1.1'

gem 'rails', '4.1.6'
gem 'pg'
gem 'pg_search'
gem 'sass-rails', '~> 4.0.3'
gem 'bootstrap-sass'
gem 'haml'
gem 'rails_12factor'
gem 'uglifier', '>= 1.3.0'
gem 'coffee-rails', '~> 4.0.0'
gem 'jquery-rails'
gem 'turbolinks'
gem 'jbuilder', '~> 1.2'
gem 'piwik_analytics', '~> 1.0.2'

gem 'geocoder', '~> 1.2.1'
gem 'activeadmin', git: 'https://github.com/gregbell/active_admin.git'
gem 'devise', '~> 3.2'
gem 'rakismet'

gem 'country_select'

gem 'mail_form'
gem 'simple_form', '~> 3.0.2'

gem 'grape', '0.7.0'
gem 'grape-swagger', '~> 0.7.2'
gem 'grape-kaminari'
gem 'kaminari'
gem 'high_voltage', '~> 2.4.0'

# Bugsnag sends bug alerts caught in production.
# It's free for open source projects.
gem 'bugsnag'


gem 'rack-contrib'
gem 'rack-cors', :require => 'rack/cors'

group :development, :test do
  gem 'rspec-rails', '~> 3.0.0.beta2'
  gem "factory_girl_rails", "~> 4.0"
  gem 'dotenv-rails'
  gem 'pry', '~> 0.9.12.6'
  gem 'quiet_assets', '~> 1.0.2'
  gem 'better_errors'
  gem 'binding_of_caller'
end

group :test do
  gem 'rake'
  gem 'cucumber-rails', '~> 1.4.1', require: false
  gem 'database_cleaner'
  gem 'simplecov', '~> 0.7.1', require: false
  gem 'poltergeist'
  gem 'webmock', '~> 1.18.0'
end

group :doc do
  gem 'sdoc', require: false
end
