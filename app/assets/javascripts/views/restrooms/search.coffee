#= require lib/geocoder

# This Coffeescript file contains the class for the search bar and functionality.
# It requires the RefugeRestrooms lib geocoder.

class Refuge.Restrooms.Search
  searchDefaultText: "1 Embarcadero Center, San Francisco, CA"

  constructor: (form) ->
    # Define elements that will be in use in this class.
    @_geocoder = new Refuge.Library.Geocoder
    @_form = form
    @_searchBar = @_form.find('input.search-bar')

    @_currentLocationButton = @_form.find('.current-location-button')
    @_submitSearchButton = @_form.find('.submit-search-button')


    # Call Initialize Methods
    @_initAutocomplete()
    @_bindEvents()
    @_setDefaultText()


  _initAutocomplete: =>
    input = document.getElementById('search')
    new google.maps.places.SearchBox(input)


  _bindEvents: =>
    @_currentLocationButton.click (event) =>
      # On Search Current Location Button:
      # Get current location, update the form, and then submit.
      event.preventDefault()
      @_currentLocationButton.addClass('locating')
      @_searchCurrentLocation()

    @_submitSearchButton.click (event) =>
      # On submit button click, We geocode the search string and return
      # the latitude and longitude update the form and then submit the form.
      event.preventDefault()
      @_submitSearchButton.addClass('locating')
      @_preventSearchWithDefault()
      $('#lat').val() == undefined
      $('#long').val() == undefined
      if @_searchBar.val() == ""
        @_searchCurrentLocation()
      else
        @_searchQueryString()

    @_form.on "keypress", (event) =>
      if event.keyCode == 13
        event.preventDefault()
        @_submitSearchButton.click()
        return false


  _searchQueryString: =>
    @_geocoder.geocodeSearchString(@_searchBar.val()).then (searchCoords) =>
      @_updateForm(searchCoords.lat, searchCoords.long)
      @_form.submit()


  _searchCurrentLocation: =>
    @_geocoder.getCurrentLocation()
    .then (currentCoords) =>
        @_updateForm(currentCoords.lat, currentCoords.long, "Current Location")
        @_form.submit()
    .then null, (err) =>
        @_currentLocationButton.removeClass('locating')
        alert "To search by location, please refresh the page and allow us to access your location!"


  _updateForm: (lat,long,searchString = undefined) =>
    latField = @_form.find('#lat').val(lat)
    longField = @_form.find('#long').val(long)
    if searchString?
      searchField = @_form.find('#search').val(searchString)


  _preventSearchWithDefault: ->
    if @_searchBar.hasClass("fadedText") && @_searchBar.val() == @searchDefaultText
      @_searchBar.val("")

  _setDefaultText: =>
    if @_searchBar.val() == ""
      @_searchBar.val(@searchDefaultText)
      @_searchBar.addClass("fadedText")

      @_searchBar.focus =>
        @_searchBar.removeClass("fadedText")
        @_searchBar.val("") if @_searchBar.val() == @searchDefaultText

        @_searchBar.blur =>
          @_setDefaultText()

$ ->
  $.fn.initializeSearch       = -> new Refuge.Restrooms.Search($(@))
  $('.search-restrooms-form').initializeSearch()
