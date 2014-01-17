class Bathroom < ActiveRecord::Base
  attr_accessor :latitude, :longitude

  geocoded_by :full_address
  after_validation :geocode

  def full_address
    "#{street}, #{city}, #{state}"
  end


end
