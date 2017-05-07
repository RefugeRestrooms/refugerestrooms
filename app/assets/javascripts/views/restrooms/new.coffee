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
            console.log result[0].formatted_address
            console.log result[0]
            @_getNewForm(coords).then (data, textStatus) =>
              console.log data
              $('.form-container').html(data).hide().fadeIn()
              @_requestNearbyRestrooms(coords)


  _getNewForm: (coords) =>
    $.ajax
      type: 'GET'
      url: '/restrooms/new'
      data:
        guess: true
        restroom:
          latitude: coords.lat
          longitude: coords.long
      success: (data, textStatus) ->
        # $('.new-restrooms-form-container').html(data)


  _requestNearbyRestrooms: (coords) ->
    $.ajax
      type: 'GET'
      url: '/restrooms'
      data:
        search: true
        nearby: true
        lat: coords.lat
        long: coords.long
      success: (data, textStatus) =>
        @_guessButton.removeClass('locating')
        $('.nearby-container').html(data)

$ ->
  $.fn.initializeNewRestroomForm = -> new Refuge.Restrooms.NewRestroomForm($(@))
  $('.submit-new-bathroom-form').initializeNewRestroomForm()
