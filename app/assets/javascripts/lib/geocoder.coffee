# TODO: Update API To NOT USE GOOGLE and use Open Source

class RefugeRestrooms.Library.Geocoder
  geocodeSearchString: (string) ->
    # This function takes in a string and geocodes, returning two coordinates
    # a latitutde and longitude of the location of the search string.


  getCurrentLocation: ->
    # This function returns a promise that evaluates to an object with the
    # latitute and longitute of the current coordinates.

    support = navigator.geolocation? && navigator.geolocation
    options =
      enableHighAccuracy: true
      timeout: 5000
    promise = $.Deferred()

    # Callback functions
    success = (pos) ->
      result =
        lat: pos.coords.latitude
        long: pos.coords.longitude
      promise.resolve(result)
    error = (err) ->
      promise.reject(err)

    if support
      navigator.geolocation.getCurrentPosition( success, error, options )
    else
      # Geolocation not supported
      promise.reject(NOT_SUPPORTED)

    return promise.promise()