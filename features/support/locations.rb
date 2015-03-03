module Locations
  def locations
    {
      Winnipeg: {latitude: 49.8975494, longitude: -97.140118},
      Vancouver: {latitude: 49.281006, longitude: -123.089959},
      Oakland: {latitude: 37.8044, longitude: -122.2708}
    }
  end

  def mock_location(location_name)
    location = locations[location_name.to_sym]
    page.execute_script "
      var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

      Refuge.Library.Geocoder = (function() {
        function Geocoder() {
          this.getAddress = __bind(this.getAddress, this);
          this.geocodeSearchString = __bind(this.geocodeSearchString, this);
        }

        Geocoder.prototype.getCurrentLocation = function() {
          return jQuery.when(
            {
              latitude: #{location[:latitude]},
              longitude: #{location[:longitude]}
              });
        };

        return Geocoder;

      })();
    "
  end
end

World(Locations)
