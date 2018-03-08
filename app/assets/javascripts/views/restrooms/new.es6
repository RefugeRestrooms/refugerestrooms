/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
//= require lib/geocoder

Refuge.Restrooms.NewRestroomForm = class NewRestroomForm {
  constructor(form) {
    this._bindEvents = this._bindEvents.bind(this);
    this._bindGuessButton = this._bindGuessButton.bind(this);
    this._bindPreviewButton = this._bindPreviewButton.bind(this);
    this._rebind = this._rebind.bind(this);
    this._updateMap = this._updateMap.bind(this);
    this._onDrag = this._onDrag.bind(this);
    this._getNewForm = this._getNewForm.bind(this);
    this._updateForm = this._updateForm.bind(this);
    this._geocoder = new Refuge.Library.Geocoder;
    this._form = form;
    this._guessButton = this._form.find('.guess-btn');
    this._nearbyContainer = $('.nearby-container');
    this._form_container = $('.new-restrooms-form-container');
    this._previewButton = this._form.find('.preview-btn');
    this._map = this._form.find('#mapArea')[0];

    // Initialization Methods
    this._bindEvents();
  }

  _bindEvents() {
    this._bindGuessButton();
    return this._bindPreviewButton();
  }

  _bindGuessButton() {
    return this._guessButton.click(event => {
      this._guessButton.addClass('locating');
      event.preventDefault();
      return this._geocoder.getCurrentLocation().then(coords => {
        return this._geocoder.getAddress(coords).then(result => {
          console.log("hit the callback");
          if ((result != null) && (result.length > 0)) {
            console.log(result[0].formatted_address);
            console.log(result[0]);
            return this._getNewForm(coords).then((data, textStatus) => {
              console.log(data);
              return this._updateForm(coords, data, textStatus);
            });
          }
        });
      });
    });
  }


  _bindPreviewButton() {
    return this._previewButton.click(event => {
      const form = this._form[0];
      const street = form.elements.restroom_street.value;
      const city = form.elements.restroom_city.value;
      const state = form.elements.restroom_state.value;
      const country = form.elements.restroom_country.value;
      const address = `${street}, ${city}, ${state}, ${country}`;

      // Obtain coordinates
      return this._geocoder.geocodeSearchString(address).then(coords => {
        return this._updateMap(coords);
      });
    });
  }


  _rebind() {
    this._map = $("#mapArea").get(0);
    this._previewButton = $(".preview-btn");
    this._guessButton = $(".guess-btn");

    this._bindEvents();

    // Rebind form
    return this._form = $('form.simple_form');
  }


  _updateMap(coords) {
    // Show map
    this._map.classList.remove("hidden");

    this._map.dataset.latitude = coords.lat;
    this._map.dataset.longitude = coords.long;
    return Maps.reloadDraggable(this._map, this._onDrag);
  }

  // Callback for map marker 'dragend' event
  _onDrag(event) {
    const coords = {
      lat: event.latLng.lat(),
      long: event.latLng.lng()
    };
    return this._getNewForm(coords).then((data, textStatus) => {
      return this._updateForm(coords, data, textStatus);
    });
  }

  _getNewForm(coords) {
    return $.ajax({
      type: 'GET',
      url: '/restrooms/new',
      data: {
        guess: true,
        restroom: {
          latitude: coords.lat,
          longitude: coords.long
        }
      }
    });
  }

  _updateForm(coords, data, textStatus) {
    $('.form-container').html(data).hide().fadeIn();
    this._rebind();
    this._requestNearbyRestrooms(coords);
    return this._updateMap(coords);
  }

  _requestNearbyRestrooms(coords) {
    return $.ajax({
      type: 'GET',
      url: '/restrooms',
      data: {
        search: true,
        nearby: true,
        lat: coords.lat,
        long: coords.long
      },
      success: (data, textStatus) => {
        this._guessButton.removeClass('locating');
        return $('.nearby-container').html(data);
      }
    });
  }
};

$(function() {
  $.fn.initializeNewRestroomForm = function() { return new Refuge.Restrooms.NewRestroomForm($(this)); };
  return $('.submit-new-bathroom-form').initializeNewRestroomForm();
});
