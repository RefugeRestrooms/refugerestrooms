# Note:
# In the dataset on which the application is based, UNISEX is coded by 0, ADA
# (accessible) is coded by 1

class Bathroom < ActiveRecord::Base

  geocoded_by :full_address
  after_validation :geocode, :lookup => :google

  scope :unisex, -> (unisex) { where(bath_type: unisex) if unisex != nil }
  scope :ada, -> (ada) { where(access: ada) if ada != nil }

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

end
