/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
//= require lib/geocoder

// This Coffeescript file contains the class for the search bar and functionality.
// It requires the RefugeRestrooms lib geocoder.

const Cls = (Refuge.Restrooms.Search = class Search {
  static initClass() {
    this.prototype.searchDefaultText = "1 Embarcadero Center, San Francisco, CA";
  }

  constructor(form) {
    // Define elements that will be in use in this class.
    this._initAutocomplete = this._initAutocomplete.bind(this);
    this._bindEvents = this._bindEvents.bind(this);
    this._searchQueryString = this._searchQueryString.bind(this);
    this._searchCurrentLocation = this._searchCurrentLocation.bind(this);
    this._updateForm = this._updateForm.bind(this);
    this._setDefaultText = this._setDefaultText.bind(this);
    this._geocoder = new Refuge.Library.Geocoder;
    this._form = form;
    this._searchBar = this._form.find('input.search-bar');

    this._currentLocationButton = this._form.find('.current-location-button');
    this._submitSearchButton = this._form.find('.submit-search-button');


    // Call Initialize Methods
    this._initAutocomplete();
    this._bindEvents();
    this._setDefaultText();
  }


  _initAutocomplete() {
    const input = document.getElementById('search');
    return new google.maps.places.SearchBox(input);
  }


  _bindEvents() {
    this._currentLocationButton.click(event => {
      // On Search Current Location Button:
      // Get current location, update the form, and then submit.
      event.preventDefault();
      this._currentLocationButton.addClass('locating');
      return this._searchCurrentLocation();
    });

    this._submitSearchButton.click(event => {
      // On submit button click, We geocode the search string and return
      // the latitude and longitude update the form and then submit the form.
      event.preventDefault();
      this._submitSearchButton.addClass('locating');
      this._preventSearchWithDefault();
      $('#lat').val() === undefined;
      $('#long').val() === undefined;
      if (this._searchBar.val() === "") {
        return this._searchCurrentLocation();
      } else {
        return this._searchQueryString();
      }
    });

    return this._form.on("keypress", event => {
      if (event.keyCode === 13) {
        event.preventDefault();
        this._submitSearchButton.click();
        return false;
      }
    });
  }


  _searchQueryString() {
    return this._geocoder.geocodeSearchString(this._searchBar.val()).then(searchCoords => {
      this._updateForm(searchCoords.lat, searchCoords.long);
      return this._form.submit();
    });
  }


  _searchCurrentLocation() {
    return this._geocoder.getCurrentLocation()
      .then(currentCoords => {
        this._updateForm(currentCoords.lat, currentCoords.long, "Current Location");
        return this._form.submit();
    }).then(null, err => {
        this._currentLocationButton.removeClass('locating');
        return alert("To search by location, please refresh the page and allow us to access your location!");
    });
  }


  _updateForm(lat,long,searchString) {
    if (searchString == null) { searchString = undefined; }
    const latField = this._form.find('#lat').val(lat);
    const longField = this._form.find('#long').val(long);
    if (searchString != null) {
      let searchField;
      return searchField = this._form.find('#search').val(searchString);
    }
  }


  _preventSearchWithDefault() {
    if (this._searchBar.hasClass("fadedText") && (this._searchBar.val() === this.searchDefaultText)) {
      return this._searchBar.val("");
    }
  }

  _setDefaultText() {
    if (this._searchBar.val() === "") {
      this._searchBar.val(this.searchDefaultText);
      this._searchBar.addClass("fadedText");

      return this._searchBar.focus(() => {
        this._searchBar.removeClass("fadedText");
        if (this._searchBar.val() === this.searchDefaultText) { this._searchBar.val(""); }

        return this._searchBar.blur(() => {
          return this._setDefaultText();
        });
      });
    }
  }
});
Cls.initClass();

$(function() {
  $.fn.initializeSearch       = function() { return new Refuge.Restrooms.Search($(this)); };
  return $('.search-restrooms-form').initializeSearch();
});
