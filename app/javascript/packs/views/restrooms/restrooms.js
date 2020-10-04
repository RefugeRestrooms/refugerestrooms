// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
// You can use CoffeeScript in this file: http://coffeescript.org/

$(() => {
  function getSearchParams() {
    const { search: search } = location;
    return new URLSearchParams(search);
  }
  function applyFilters(filters) {
    const { origin: url, pathname: path } = location;
    const searchParams = getSearchParams();
    searchParams.set('filters', filters);
    location = `${url}${path}?${searchParams.toString()}`
  }

  function getFilters() {
    const searchParams = getSearchParams();
    const filters = searchParams.get('filters') || '';
    return filters.split(',').filter(filter => filter && filter.length > 0);
  }

  function removeFilter(toRemove) {
    const filters =
      getFilters()
      .filter((filter) => filter != toRemove);

    applyFilters(filters);
  }

  function addFilter(filter) {
    let filters = getFilters();

    if (filters.indexOf(filter) == -1) {
      filters.push(filter);
    }

    applyFilters(filters);
  }

  function addOnClickEvent([filterElementId, filter]) {
    $(filterElementId).click(function() {
      if ($(this).hasClass("active")) {
        removeFilter(filter);
      } else {
        addFilter(filter);
      }
    });
  }

  const filters = {
    '#ada_filter': 'accessible',
    '#unisex_filter': 'unisex',
    '#changing_table_filter': 'changing_table'
  }

  Object.entries(filters).forEach(addOnClickEvent);
});
