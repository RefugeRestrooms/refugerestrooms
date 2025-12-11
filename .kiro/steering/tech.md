# Technology Stack

## Core Framework

- **Ruby**: 3.2.2
- **Rails**: 7.1.2
- **Database**: PostgreSQL with pg_search for full-text search
- **Node**: 16.x
- **Yarn**: 1.x

## Backend Stack

- **API Framework**: Grape (v1.6.2) for REST API
- **Authentication**: Devise (v4.8.1)
- **Admin Panel**: ActiveAdmin (v3.1.0)
- **Geocoding**: Geocoder gem (v1.6.1) with Google Maps API
- **Pagination**: Pagy (API), Kaminari (legacy)
- **Spam Protection**: Rakismet
- **Error Tracking**: Bugsnag
- **CORS**: rack-cors for API access

## Frontend Stack

- **Asset Pipeline**: Webpacker 5 for JavaScript, Sprockets for CSS
- **CSS Framework**: Bootstrap 4 (via bootstrap-sass)
- **CSS Preprocessor**: SASS/SCSS
- **Template Engine**: HAML for views
- **JavaScript**: jQuery, Rails UJS, Turbolinks
- **Forms**: SimpleForm with Bootstrap integration

## Testing

- **Framework**: RSpec
- **Feature Tests**: Capybara with Cuprite (headless Chrome)
- **Factories**: FactoryBot
- **Mocking**: WebMock
- **Coverage**: SimpleCov
- **Code Quality**: RuboCop with Rails and RSpec extensions

## Deployment

- **Platform**: Heroku
- **Web Server**: Puma
- **CI/CD**: Travis CI
- **Environments**: Production, Staging

## Common Commands

### Setup
```bash
bundle install
yarn install
rails db:create db:migrate db:seed
```

### Development
```bash
rails server              # Start Rails server (port 3000)
bin/webpack-dev-server    # Start Webpack dev server
rails console             # Rails console
```

### Testing
```bash
bundle exec rspec                    # Run all tests
bundle exec rspec spec/models        # Run model tests
bundle exec rspec spec/features      # Run feature tests
bundle exec rubocop                  # Run linter
bundle exec rubocop -a               # Auto-fix linting issues
```

### Database
```bash
rails db:migrate              # Run migrations
rails db:rollback             # Rollback last migration
rails db:reset                # Drop, create, migrate, seed
```

### Assets
```bash
rails assets:precompile       # Compile assets for production
bin/webpack                   # Compile JavaScript with Webpack
```

## API Documentation

- Grape Swagger generates API docs
- Available at `/api/docs`
- Swagger UI integration for interactive testing
