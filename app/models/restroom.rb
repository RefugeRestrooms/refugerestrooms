# Note:
# In the dataset on which the application is based, UNISEX is coded by 0, ADA
# (accessible) is coded by 1

class Restroom < ApplicationRecord

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

  if Rails.env != "test"
    validates :name, :street, :city, :state, presence: true
    validates :street, uniqueness: {scope: [:city, :state], message: "is already registered"}
  end

  geocoded_by :full_address
  before_validation :perform_geocoding, if: ->(obj){ require_geocoding? }
  before_validation :reverse_geocode, if: ->(obj){ require_geocoding? }

  reverse_geocoded_by :latitude, :longitude do |obj, results|
    if geo = results.first
      obj.street  = geo.address.split(',').first
      obj.city    = geo.city
      obj.state   = geo.state
      obj.country = geo.country_code
    end
  end

  include Rakismet::Model
  rakismet_attrs content: proc {
    name + street + city + state + comment + directions + country
  }

  after_find :strip_slashes

  scope :current, -> {
    Restroom.where('id IN (SELECT MAX(id) FROM restrooms WHERE approved = true GROUP BY edit_id)')
  }

  scope :accessible, -> { where(accessible: true) }
  scope :changing_table, -> { where(changing_table: true) }
  scope :unisex, -> { where(unisex: true) }

  scope :created_since, ->(date) { where("created_at >= ?", date) }
  scope :updated_since, ->(date) { where("updated_at >= ?", date) }

  def require_geocoding?
    return false if Rails.env == "test"
    full_address.present?
  end

  def full_address
    [street, city, state, country].compact.join(",")
  end

  def rated?
    upvote > 0 || downvote > 0
  end

  def rating_percentage
    return 0 unless rated?

    upvote.to_f / (upvote + downvote).to_f * 100
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

  def perform_geocoding
    geocode
  end
end
