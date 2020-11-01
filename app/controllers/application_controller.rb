class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  around_action :switch_locale
  before_action :mobile_filter_header

  def mobile_filter_header
    @mobile = true
  end

  def switch_locale(&action)
    locale = params[:locale] || http_accept_language.language_region_compatible_from(I18n.available_locales)
    locale ||= I18n.default_locale

    I18n.with_locale(locale, &action)
  end

  def default_url_options
    { locale: I18n.locale }
  end
end
