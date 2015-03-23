# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/
Refuge.Restrooms.Index = {
  mapContainer: $("#mapContainer")
  initMap: ->
    params = Refuge.Library.Helpers.URL.getParams()
    console.log(params)
    if 'map' of params and params['map'] == 'true'
      console.log('on')
    else
      console.log('off')
      this.mapContainer.hide()
      this.mapContainer.height(0)
}

$ ->
  Refuge.Restrooms.Index.initMap()

  $('#map_filter').click ->
    if $(this).hasClass("active")
      window.location.href = Refuge.Library.Helpers.URL.replaceSearchParam('map', false)
    else
      window.location.href = Refuge.Library.Helpers.URL.replaceSearchParam('map', true)

