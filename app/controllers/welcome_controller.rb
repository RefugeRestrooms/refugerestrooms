class WelcomeController < ApplicationController
  layout 'splash', only: [:index]

  def index
    @cities = Restroom.topcities
  end
end
