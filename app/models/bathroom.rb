# Note:
# In the dataset on which the application is based, UNISEX is coded by 0, ADA
# (accessible) is coded by 1

class Bathroom < ActiveRecord::Base

  include PgSearch
  pg_search_scope :search, against: {
    :name => 'A',
    :street => 'B',
    :city => 'C',
    :state => 'D',
    :comment => 'B',
    :directions => 'B',
    :country => 'D',
  },
  using: {tsearch: {dictionary: "english"}},
  ignoring: :accents

  validates :name, :street, :city, :state, presence: true

  geocoded_by :full_address
  after_validation :geocode, :lookup => :google

  reverse_geocoded_by :latitude, :longitude do |obj, results|
    if geo = results.first
      obj.name    = geo.address
      obj.street  = geo.address.split(',').first
      obj.city    = geo.city
      obj.state   = geo.state
      obj.country = geo.country
    end
  end

  after_find :strip_slashes

  scope :accessible, -> { where(access: 1) }
  scope :unisex, -> { where(bath_type: 0) }

  def full_address
    "#{street}, #{city}, #{state}, #{country}"
  end

  def rated?
    upvote > 0 || downvote > 0
  end

  def rating_percentage
    return 0 unless rated?

    upvote.to_f / (upvote + downvote).to_f * 100
  end

  def unisex?
    bath_type == 0
  end

  def accessible?
    access == 1
  end

  # PostgreSQL Full-Text Search for the API.
  def self.text_search(query)
    if query.present?
      search(query)
    else
      all
    end
  end

  private

    def strip_slashes
      ['name', 'street', 'city', 'state', 'comment', 'directions'].each do |field|
        attributes[field].try(:gsub!, "\\'", "'")
      end
    end

end
