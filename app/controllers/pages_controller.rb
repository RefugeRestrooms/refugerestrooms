class PagesController < ApplicationController
  include HighVoltage::StaticPage
  layout 'splash', only: [:index]
end
