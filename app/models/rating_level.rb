class RatingLevel
  def self.for_restroom(restroom)
    percentage = restroom.rating_percentage

    if percentage > 70
      self.green
    elsif percentage > 50
      self.yellow
    else
      self.red
    end
  end

  def self.green
    new('Green')
  end

  def self.yellow
    new('Yellow')
  end

  def self.red
    new('Red')
  end

  def initialize(level)
    @level = level
  end

  def hash
    @level.hash
  end

  def ==(other)
    eql?(other)
  end

  def eql?(other)
    self.class == other.class && to_s == other.to_s
  end

  def to_s
    @level.to_s
  end
end
