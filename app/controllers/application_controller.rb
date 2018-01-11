class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_action :mobile_filter_header
  before_action :set_locale

  def mobile_filter_header
    @mobile = true
  end

  def mobile_filter_header
    @mobile = true
  end

   def set_locale
     I18n.locale = extract_locale_from_accept_language_header
   end

  private
    def extract_locale_from_accept_language_header
      accept_language = request.env['HTTP_ACCEPT_LANGUAGE']
      if accept_language.nil?
        "en"
      else
        request.env['HTTP_ACCEPT_LANGUAGE'].scan(/^[a-z]{2}/).first
      end
    end

end
