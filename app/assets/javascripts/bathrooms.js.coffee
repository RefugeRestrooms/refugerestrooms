# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

$ ->
  $('#ada_filter .filter_off').click -> 
    $('#ada_filter .filter_off').hide()
    $('#ada_filter .filter_on').show()
    $('.listItem.not_accessible').hide()
    
  $('#ada_filter .filter_on').click -> 
    $('#ada_filter .filter_on').hide()
    $('#ada_filter .filter_off').show()
    $('.listItem.not_accessible').show()
    
  $('#unisex_filter .filter_off').click -> 
    $('#unisex_filter .filter_off').hide()
    $('#unisex_filter .filter_on').show()
    $('.listItem.not_unisex').hide()
    
  $('#unisex_filter .filter_on').click -> 
    $('#unisex_filter .filter_on').hide()
    $('#unisex_filter .filter_off').show()
    $('.listItem.not_unisex').show()
