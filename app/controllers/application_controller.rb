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
    I18n.with_locale(current_locale, &action)
  end

  def default_url_options
    { locale: I18n.locale }
  end

  def current_locale
    LocaleService.call(params[:locale], http_accept_locale)
  end

  helper_method :current_locale

  private

  def http_accept_locale
    http_accept_language.language_region_compatible_from(I18n.available_locales)
  end
end
