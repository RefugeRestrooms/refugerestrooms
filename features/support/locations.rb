module Locations
  def locations
    {
      Winnipeg: {latitude: 49.8975494, longitude: -97.140118},
      Vancouver: {latitude: 49.281006, longitude: -123.089959}
    }
  end

  def mock_location(location_name)
    location = locations[location_name.to_sym]
    page.execute_script "navigator.geolocation = {getCurrentPosition: function(success) { success({coords: {latitude: #{location[:latitude]}, longitude: #{location[:longitude]}}}); }}"
  end
end

World(Locations)
