require 'test_helper'

describe RatingLevel do
  describe '.for_bathroom' do
    it 'returns green level for bathrooms with a rating higher than 70%' do
      with_percentage_return(71, RatingLevel.green)
      with_percentage_return(80, RatingLevel.green)
    end

    it 'returns red level for bathrooms with a rating up to 50%' do
      with_percentage_return(40, RatingLevel.red)
      with_percentage_return(50, RatingLevel.red)
    end

    it 'returns yellow level for bathrooms with a rating between 51% and 70%' do
      with_percentage_return(51, RatingLevel.yellow)
      with_percentage_return(60, RatingLevel.yellow)
      with_percentage_return(70, RatingLevel.yellow)
    end
  end
end

def with_percentage_return(percentage, response)
  @bathroom = Minitest::Mock.new
  @bathroom.expect :rating_percentage, percentage
  RatingLevel.for_bathroom(@bathroom).must_equal response
  @bathroom.verify
end
