#= require lib/geocoder

class RefugeRestrooms.NewRestroomForm
  constructor: (form) ->
    console.log("Form initialized")
    @_geocoder = new RefugeRestrooms.Library.Geocoder
    @_form = form
    @_guessButton = @_form.find('.guess-button')
    console.log @_guessButton

    # Initialization Methods
    @_bindEvents()

  _bindEvents: =>
    console.log ("Binding form events")
    @_bindGuessButton()

  _bindGuessButton: =>
    console.log "Binding Guess Button"
    @_guessButton.click (event) =>
      console.log( "You clicked the guess button")
      event.preventDefault()

      @_geocoder.getCurrentLocation().then (coords) =>
        console.log coords
        @_geocoder.getAddress(coords).then (result) ->
          console.log(result)

$ ->
  $.fn.initializeNewRestroomForm = -> new RefugeRestrooms.NewRestroomForm($(@))
  $('.submit-new-bathroom-form').initializeNewRestroomForm()