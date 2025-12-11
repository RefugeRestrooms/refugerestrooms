# Project Structure

## Application Organization

Standard Rails 7 application structure with Grape API integration.

### Core Directories

**app/** - Main application code
- `admin/` - ActiveAdmin configuration for admin panel
- `assets/` - Images, fonts, stylesheets (SCSS)
- `controllers/` - Rails controllers and API endpoints
  - `api/` - Grape API (versioned under `v1/`)
  - Standard controllers for web interface
- `helpers/` - View helpers (Pagy, reCAPTCHA, restrooms)
- `javascript/packs/` - Webpacker entry points
  - `lib/` - Shared JavaScript utilities (geocoder, maps)
  - `views/` - Page-specific JavaScript organized by controller
- `models/` - ActiveRecord models
  - Core model: `Restroom`
  - Supporting: `AdminUser`, `Contact`, `RatingLevel`
- `services/` - Service objects (e.g., `SaveRestroom`)
- `views/` - HAML templates organized by controller

**config/** - Configuration files
- `initializers/` - Gem and app initialization
- `locales/` - I18n translations (en, es, fil, fr, hi, it, pl, pt-BR)
- `webpack/` - Webpacker configuration
- `routes.rb` - Route definitions

**spec/** - RSpec test suite
- `api/` - API endpoint tests
- `controllers/` - Controller tests
- `features/` - Capybara feature tests
- `models/` - Model tests
- `services/` - Service object tests
- `support/` - Test helpers and shared examples
- `factories/` - FactoryBot factories

**db/** - Database files
- `migrate/` - Database migrations
- `schema.rb` - Current database schema

**lib/** - Extended library code
- `tasks/` - Custom Rake tasks
- `templates/` - Rails generators templates

**public/** - Static files served directly

## Key Architectural Patterns

### API Structure
- Grape API mounted at `/api`
- Versioned endpoints under `API::V1`
- Separate from Rails controllers
- JSON-only responses with Pagy pagination

### Model Patterns
- `Restroom` is the central model
- Uses `pg_search` for full-text search
- Geocoder integration for location features
- Scopes for filtering (accessible, unisex, changing_table)
- Edit tracking via `edit_id` field

### View Organization
- HAML templates
- Partials prefixed with underscore
- Organized by controller/action
- Shared layouts in `app/views/layouts/`

### Asset Pipeline
- **JavaScript**: Webpacker (modern JS in `app/javascript/packs/`)
- **CSS**: Sprockets (SCSS in `app/assets/stylesheets/`)
- Component-based SCSS organization (components/, pages/, map/, restrooms/)

### Internationalization
- Translations organized by language in `config/locales/{locale}/`
- Separate files per feature (restrooms, navigation, search, etc.)
- Default locale: English (en)

## Configuration Files

- `.rubocop.yml` - Ruby linting rules
- `babel.config.js` - JavaScript transpilation
- `postcss.config.js` - CSS processing
- `webpacker.yml` - Webpacker settings
- `.env` - Environment variables (not in git)

## Testing Conventions

- Model specs in `spec/models/`
- Controller specs in `spec/controllers/`
- API specs in `spec/api/`
- Feature specs in `spec/features/`
- Factories in `spec/factories/`
- Shared examples in `spec/support/shared_examples/`
