# TODO: Update API To NOT USE GOOGLE and use Open Source

class Refuge.Library.Geocoder
  statusOK: google.maps.GeocoderStatus.OK
  googleGeocoder: new google.maps.Geocoder()

  geocodeSearchString: (address) =>
    _googleGeocoder = new google.maps.Geocoder()

    # This function takes in a string and geocodes it, returning two coordinates.
    # It will resolve a promise with an object that contains the
    # latitude and longtitude.

    requestBody = { 'address': address }
    promise = $.Deferred()

    success = (results, status) =>
      if (status == @statusOK)
        coords =
          lat: results[0].geometry.location.lat(),
          long: results[0].geometry.location.lng()
        promise.resolve(coords)
      else
        promise.reject(status)
    fail = (err) ->
      promise.rejext(err)

    _googleGeocoder.geocode(requestBody, success, fail)

    return promise.promise()

  getAddress: (coords) =>
    requestBody = {'location': new google.maps.LatLng(coords.lat, coords.long)}
    promise = $.Deferred()

    console.log requestBody
    success = (results, status) =>
      if status == @statusOK
        promise.resolve(results)
    fail = (err) ->
      promise.fail(err)

    @googleGeocoder.geocode(requestBody, success, fail)

    return promise.promise()


  getCurrentLocation: ->
    # This function returns a promise that evaluates to an object with the
    # latitude and longitute of the current coordinates.

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
      promise.reject("Not Supported")

    return promise.promise()
