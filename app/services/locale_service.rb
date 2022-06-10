class LocaleService
  def self.call(param_locale, browser_locale)
    new(param_locale, browser_locale).perform
  end

  def initialize(param_locale, browser_locale)
    @param_locale = param_locale
    @browser_locale = browser_locale
    @default = I18n.default_locale
  end

  def perform
    return @param_locale if @param_locale.present?

    @browser_locale || @default
  end
end
