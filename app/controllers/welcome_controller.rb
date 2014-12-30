class WelcomeController < ApplicationController
  layout 'splash', only: [:index]

  def index
    @cities = Restroom.top_cities
  end
end
