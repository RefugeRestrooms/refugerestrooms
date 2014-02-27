SaferstallsRails::Application.configure do
  DEVISE_SECRET_KEY = '8d1014508e87bd179cabfd63646d29571f8573b5010f1ffb78536cebfa58ce4b06f791d62142bd24aae68a8f872d5f42cabbda9aa0207d2b2c32c9749840a17f'
  RAILS_SECRET_KEY = 'd68aab12ae1506435fe1e9ef0ed25b25a5f9f67b7f6c41e2b9c3c44c89315f0d1324235870a9139104646c4f0e27870863193e08044a821069963cc68a2c1385'

  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = false

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise an error on page load if there are pending migrations
  config.active_record.migration_error = :page_load

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  config.assets.debug = true
end

  