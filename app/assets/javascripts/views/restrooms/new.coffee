#= require lib/geocoder

class Refuge.Restrooms.NewRestroomForm
  constructor: (form) ->
    @_geocoder = new Refuge.Library.Geocoder
    @_form = form
    @_guessButton = @_form.find('.guess-btn')
    @_nearbyContainer = $('.nearby-container')
    @_form_container = $('.new-restrooms-form-container')

    # Initialization Methods
    @_bindEvents()

  _bindEvents: =>
    @_bindGuessButton()

  _bindGuessButton: =>
    @_guessButton.click (event) =>
      @_guessButton.addClass('locating')
      event.preventDefault()
      @_geocoder.getCurrentLocation().then (coords) =>
        @_geocoder.getAddress(coords).then (result) =>
          console.log "hit the callback"
          if result? && result.length > 0
            @_getNewForm(coords).then =>
              @_requestNearbyRestrooms(coords)


  _getNewForm: =>
    $.ajax
      type: 'GET'
      url: '/restrooms/new'
      data:
        guess: true
        restroom:
          latitude: coords.lat
          longitude: coords.long
      success: (data, textStatus) ->
        $('.new-restrooms-form-container').html(data)

  _requestNearbyRestrooms: (coords) ->
    $.ajax
      type: 'GET'
      url: '/restrooms'
      data:
        nearby: true
        lat: coords.lat
        long: coords.long
      success: (data, textStatus) ->
        @_nearbyContainer.html(data)

$ ->
  $.fn.initializeNewRestroomForm = -> new Refuge.Restrooms.NewRestroomForm($(@))
  $('.submit-new-bathroom-form').initializeNewRestroomForm()