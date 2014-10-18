class WelcomeController < ApplicationController
  layout 'splash', only: [:index]
end
