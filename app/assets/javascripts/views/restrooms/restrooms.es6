/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
// You can use CoffeeScript in this file: http://coffeescript.org/

$(function() {
  $('#ada_filter').click(function() {
    if ($(this).hasClass("active")) {
      return $('.listItem.not_accessible').show();
    } else {
      return $('.listItem.not_accessible').hide();
    }
  });

  $('#unisex_filter').click(function() {
    if ($(this).hasClass("active")) {
      return $('.listItem.not_unisex').show();
    } else {
      return $('.listItem.not_unisex').hide();
    }
  });

  return $('#changing_table_filter').click(function() {
    if ($(this).hasClass("active")) {
      return $('.listItem.no_changing_table').show();
    } else {
      return $('.listItem.no_changing_table').hide();
    }
  });
});
