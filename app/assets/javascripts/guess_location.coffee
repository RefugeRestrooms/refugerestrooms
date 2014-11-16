$ ->


  $("#guess").click () ->
    $("#guess").toggleClass('locating')

    RefugeRestrooms.locator.get().then (coords) ->
      $('.currentLocationButton').removeClass('currentLocationButtonLocating')

      guessPosition(coords)
