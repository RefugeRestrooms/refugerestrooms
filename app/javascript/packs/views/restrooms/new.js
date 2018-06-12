import { Geocoder } from '../../lib/geocoder';
import { Maps } from '../../lib/maps';

class NewRestroomForm {
  constructor(form) {
    this._bindEvents = this._bindEvents.bind(this);
    this._bindGuessButton = this._bindGuessButton.bind(this);
    this._bindPreviewButton = this._bindPreviewButton.bind(this);
    this._rebind = this._rebind.bind(this);
    this._updateMap = this._updateMap.bind(this);
    this._onDrag = this._onDrag.bind(this);
    this._getNewForm = this._getNewForm.bind(this);
    this._updateForm = this._updateForm.bind(this);
    this._geocoder = new Geocoder;
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
    this._bindPreviewButton();
  }

  _bindGuessButton() {
    this._guessButton.click(event => {
      this._guessButton.addClass('locating');
      event.preventDefault();
      this._geocoder.getCurrentLocation().then(coords => {
        this._geocoder.getAddress(coords).then(result => {
          console.log("hit the callback");
          if (result && result.length > 0) {
            console.log(result[0].formatted_address);
            console.log(result[0]);
            this._getNewForm(coords).then((data, textStatus) => {
              console.log(data);
              this._updateForm(coords, data, textStatus);
            });
          }
        });
      });
    });
  }


  _bindPreviewButton() {
    this._previewButton.click(event => {
      const form = this._form[0];
      const street = form.elements.restroom_street.value;
      const city = form.elements.restroom_city.value;
      const state = form.elements.restroom_state.value;
      const country = form.elements.restroom_country.value;
      const address = `${street}, ${city}, ${state}, ${country}`;

      // Obtain coordinates
      this._geocoder.geocodeSearchString(address).then(coords => {
        this._updateMap(coords);
      });
    });
  }


  _rebind() {
    this._map = $("#mapArea").get(0);
    this._previewButton = $(".preview-btn");
    this._guessButton = $(".guess-btn");

    this._bindEvents();

    // Rebind form
    this._form = $('form.simple_form');
  }


  _updateMap(coords) {
    // Show map
    this._map.classList.remove("hidden");

    this._map.dataset.latitude = coords.lat;
    this._map.dataset.longitude = coords.long;
    Maps.reloadDraggable(this._map, this._onDrag);
  }

  // Callback for map marker 'dragend' event
  _onDrag(event) {
    const coords = {
      lat: event.latLng.lat(),
      long: event.latLng.lng()
    };
    this._getNewForm(coords).then((data, textStatus) => {
      this._updateForm(coords, data, textStatus);
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
    this._updateMap(coords);
  }

  _requestNearbyRestrooms(coords) {
    $.ajax({
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
        $('.nearby-container').html(data);
      }
    });
  }
};

$(() => {
  $.fn.initializeNewRestroomForm = function() { return new NewRestroomForm($(this)); };
  $('.submit-new-bathroom-form').initializeNewRestroomForm();
});
