class Bathroom < ActiveRecord::Base

  geocoded_by :full_address
  after_validation :geocode

  scope :unisex, -> (unisex) { where(bath_type: unisex) if unisex != nil }
  scope :ada, -> (ada) { where(access: ada) if ada != nil }

  def full_address
    "#{street}, #{city}, #{state}, #{country}"
  end

end
