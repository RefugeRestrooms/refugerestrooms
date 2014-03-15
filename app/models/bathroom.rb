# Note:
# In the dataset on which the application is based, UNISEX is coded by 0, ADA
# (accessible) is coded by 1

class Bathroom < ActiveRecord::Base

  validates :name, :street, :city, :state, presence: true

  geocoded_by :full_address
  after_validation :geocode, :lookup => :google

  after_find :strip_slashes

  def full_address
    "#{street}, #{city}, #{state}, #{country}"
  end

  def upvote!
    self.upvote += 1
  end

  def downvote!
    self.downvote += 1
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
      where('name @@ ? OR street @@ ? OR city @@ ? OR comment @@ ?', query, query, query, query)
    else
      scoped
    end
  end

  private

    def strip_slashes
      ['name', 'street', 'city', 'state', 'comment', 'directions'].each do |field|
        attributes[field].try(:gsub!, "\\'", "'")
      end
    end

end
