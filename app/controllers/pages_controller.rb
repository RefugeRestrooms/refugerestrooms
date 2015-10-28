class PagesController < ApplicationController
  include HighVoltage::StaticPage
  layout 'splash', only: [:index]

  def index
    @cities = Restroom.top_cities
  end
end
