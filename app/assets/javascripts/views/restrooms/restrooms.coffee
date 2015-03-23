# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

$ ->
  $('#ada_filter').click ->
    if $(this).hasClass("active")
      window.location.href = Refuge.Library.Helpers.URL.replaceSearchParameter('ada', false)
    else
      window.location.href = Refuge.Library.Helpers.URL.replaceSearchParameter('ada', true)

  $('#unisex_filter').click ->
    if $(this).hasClass("active")
      window.location.href = Refuge.Library.Helpers.URL.replaceSearchParameter('unisex', false)
    else
      window.location.href = Refuge.Library.Helpers.URL.replaceSearchParameter('unisex', true)
