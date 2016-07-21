module RestroomsHelper
  KILO_DISTANCE_CONVERSION = 1.609344
  def miles_to_kilometers(miles)
    miles * KILO_DISTANCE_CONVERSION
  end
end
