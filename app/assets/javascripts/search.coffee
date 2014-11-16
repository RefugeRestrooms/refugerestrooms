#= require lib/geocoder

# This Coffeescript file contains the class for the search bar and functionality.
# It requires the RefugeRestrooms lib geocoder.

class RefugeRestrooms.Search
  constructor: (form) ->
    # Define elements that will be in use in this class.
    @_form = form
    @_searchBar = @_form.find('input.search-bar')
    @_currentLocationButton = @_form.find('input.current-location-button')
    @_submitSearchButton = @_form.find('input.submit-search-button')
    @_geocoder = new RefugeRestrooms.Library.Geocoder

    # Call Initialize Methods
    @_bindEvents()
    @_setDefaultText()


  _bindEvents: =>
    # Bind the events to occur on button click.
    @_bindSearchButton()
    @_bindCurrenetLocationButton()


  _bindSearchButton: =>
    # On submit button click, We geocode the search string and return
    # the latitude and longitude update the form and then submit the form.
    @_submitSearchButton.click (event) ->
      event.preventDefault()
      console.log ("You hit the submit button")
      @_form.
      # @_geocodeSearchString()
      # @_submitSearch()


  _bindCurrenetLocationButton: =>
    # On Search Current Location Button:
    # Get current location, update the form, and then submit.
    @_currentLocationButton.click (event) =>
    event.preventDefault()
    console.log("You tried to search your current location")
    @_geocoder.getCurrentLocation().then (currentCoords) =>
      @_updateForm(currentCoords.lat, currentCoords.long, "Current Location")
      @_form.submit()


  _geocodeSearchString: ->
    coords = @_geocoder.geocodeSearchString(string)
    # Geocode Long/Lat
    # Form Submit


  _updateForm: (lat,long,searchString = undefined) =>
    latField = @_form.find('#lat').val(lat)
    longField = @_form.find('#long').val(long)
    if searchString?
      searchField = @_form.find('#search').val(searchString)


  _preventSearchWithDefault: ->

  _setDefaultText: ->
    searchDefaultText = "1 Embarcadero Center, San Francisco, CA"


$ ->
  $.fn.initializeSearch       = -> new RefugeRestrooms.Search($(@))
  $('.search-restrooms-form').initializeSearch()
