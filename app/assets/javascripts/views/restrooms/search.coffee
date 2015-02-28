#= require lib/geocoder

# This Coffeescript file contains the class for the search bar and functionality.
# It requires the RefugeRestrooms lib geocoder.

class Refuge.Restrooms.Search
  searchDefaultText: "1 Embarcadero Center, San Francisco, CA"

  constructor: (form) ->
    # Define elements that will be in use in this class.
    console.log("initializing search")
    @_form = form
    @_searchBar = @_form.find('input.search-bar')
    @_currentLocationButton = @_form.find('input.current-location-button')
    @_submitSearchButton = @_form.find('input.submit-search-button')
    @_geocoder = new Refuge.Library.Geocoder

    # Call Initialize Methods
    @_bindEvents()
    @_setDefaultText()


  _bindEvents: =>
    # Bind the events to occur on button click.
    @_bindSearchButton()
    @_bindCurrentLocationButton()


  _bindSearchButton: =>
    # On submit button click, We geocode the search string and return
    # the latitude and longitude update the form and then submit the form.
    @_submitSearchButton.click (event) ->
      event.preventDefault()
      @_preventSearchWithDefault()
      console.log ("You hit the submit button")
      $('#lat').val() == undefined
      $('#long').val() == undefined
      @_geocoder.geocodeSearchString(string).then (searchCoords) =>
        @_updateForm(searchCoords.lat, searchCoords.long)
        @_form.submit()


  _bindCurrentLocationButton: =>
    # On Search Current Location Button:
    # Get current location, update the form, and then submit.
    @_currentLocationButton.click (event) =>
      event.preventDefault()
      console.log("You tried to search your current location")
      @_geocoder.getCurrentLocation().then (currentCoords) =>
        @_updateForm(currentCoords.lat, currentCoords.long, "Current Location")
        @_form.submit()


  _updateForm: (lat,long,searchString = undefined) =>
    latField = @_form.find('#lat').val(lat)
    longField = @_form.find('#long').val(long)
    if searchString?
      searchField = @_form.find('#search').val(searchString)


  _preventSearchWithDefault: ->
    if @_searchBar.hasClass("fadedText") && @_searchBar.val() == @searchDefaultText
      @_searchBox.val("")


  _setDefaultText: =>
    if @_searchBar.val() == ""
      @_searchBar.val(@searchDefaultText)
      @_searchBar.addClass("fadedText")

      @_searchBar.focus =>
        @_searchBar.removeClass("fadedText")
        @_searchBar.val("")

        @_searchBar.blur =>
          @_setDefaultText()

$ ->
  $.fn.initializeSearch       = -> new Refuge.Restrooms.Search($(@))
  $('.search-restrooms-form').initializeSearch()
