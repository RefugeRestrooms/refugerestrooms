/*
Place all the behaviors and hooks related to the matching controller here.
All this logic will automatically be available in application.js.
*/

$(function() {
  $('#ada_filter').click(function() {
    if ($(this).hasClass("active")) {
      return window.location.href = Refuge.Library.Helpers.URL.replaceSearchParam('ada', false);
    } else {
      return window.location.href = Refuge.Library.Helpers.URL.replaceSearchParam('ada', true);
    }
  });
  return $('#unisex_filter').click(function() {
    if ($(this).hasClass("active")) {
      return window.location.href = Refuge.Library.Helpers.URL.replaceSearchParam('unisex', false);
    } else {
      return window.location.href = Refuge.Library.Helpers.URL.replaceSearchParam('unisex', true);
    }
  });
});
