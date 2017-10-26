#= require lib/geocoder

class Refuge.Restrooms.NewRestroomForm
  constructor: (form) ->
    @_geocoder = new Refuge.Library.Geocoder
    @_form = form
    @_guessButton = @_form.find('.guess-btn')
    @_nearbyContainer = $('.nearby-container')
    @_form_container = $('.new-restrooms-form-container')
    @_previewButton = @_form.find('.preview-btn')
    @_map = @_form.find('#mapArea')[0]

    # Initialization Methods
    @_bindEvents()

  _bindEvents: =>
    @_bindGuessButton()
    @_bindPreviewButton()

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
              @_updateForm(coords, data, textStatus)


  _bindPreviewButton: =>
    @_previewButton.click (event) =>
      form = @_form[0]
      street = form.elements.restroom_street.value
      city = form.elements.restroom_city.value
      state = form.elements.restroom_state.value
      country = form.elements.restroom_country.value
      address = "#{street}, #{city}, #{state}, #{country}"

      # Obtain coordinates
      @_geocoder.geocodeSearchString(address).then (coords) =>
        @_updateMap(coords)


  _rebind: =>
    @_map = $("#mapArea").get(0)
    @_previewButton = $(".preview-btn")
    @_guessButton = $(".guess-btn")

    @_bindEvents()

    # Rebind form
    @_form = $('form.simple_form')


  _updateMap: (coords) =>
    # Show map
    @_map.classList.remove("hidden")

    @_map.dataset.latitude = coords.lat
    @_map.dataset.longitude = coords.long
    Maps.reloadDraggable(@_map, @_onDrag)

  # Callback for map marker 'dragend' event
  _onDrag: (event) =>
    coords =
      lat: event.latLng.lat(),
      long: event.latLng.lng()
    @_getNewForm(coords).then (data, textStatus) =>
      @_updateForm(coords, data, textStatus)

  _getNewForm: (coords) =>
    $.ajax
      type: 'GET'
      url: '/restrooms/new'
      data:
        guess: true
        restroom:
          latitude: coords.lat
          longitude: coords.long

  _updateForm: (coords, data, textStatus) =>
    $('.form-container').html(data).hide().fadeIn()
    @_requestNearbyRestrooms(coords)
    @_updateMap(coords)

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
