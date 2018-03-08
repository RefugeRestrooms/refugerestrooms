/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// TODO: Update API To NOT USE GOOGLE and use Open Source

const Cls = (Refuge.Library.Geocoder = class Geocoder {
  constructor() {
    this.geocodeSearchString = this.geocodeSearchString.bind(this);
    this.getAddress = this.getAddress.bind(this);
  }

  static initClass() {
    this.prototype.statusOK = google.maps.GeocoderStatus.OK;
    this.prototype.googleGeocoder = new google.maps.Geocoder();
  }

  geocodeSearchString(address) {
    const _googleGeocoder = new google.maps.Geocoder();

    // This function takes in a string and geocodes it, returning two coordinates.
    // It will resolve a promise with an object that contains the
    // latitude and longtitude.

    const requestBody = { 'address': address };
    const promise = $.Deferred();

    const success = (results, status) => {
      if (status === this.statusOK) {
        const coords = {
          lat: results[0].geometry.location.lat(),
          long: results[0].geometry.location.lng()
        };
        return promise.resolve(coords);
      } else {
        return promise.reject(status);
      }
    };
    const fail = err => promise.reject(err);

    _googleGeocoder.geocode(requestBody, success, fail);

    return promise.promise();
  }

  getAddress(coords) {
    const requestBody = {'location': new google.maps.LatLng(coords.lat, coords.long)};
    const promise = $.Deferred();

    console.log(requestBody);
    const success = (results, status) => {
      if (status === this.statusOK) {
        return promise.resolve(results);
      }
    };
    const fail = err => promise.reject(err);

    this.googleGeocoder.geocode(requestBody, success, fail);

    return promise.promise();
  }


  getCurrentLocation() {
    // This function returns a promise that evaluates to an object with the
    // latitude and longitute of the current coordinates.

    const support = (navigator.geolocation != null) && navigator.geolocation;
    const options = {
      enableHighAccuracy: true,
      timeout: 5000
    };
    const promise = $.Deferred();

    // Callback functions
    const success = function(pos) {
      const result = {
        lat: pos.coords.latitude,
        long: pos.coords.longitude
      };
      return promise.resolve(result);
    };
    const error = err => promise.reject(err);

    if (support) {
      navigator.geolocation.getCurrentPosition( success, error, options );
    } else {
      // Geolocation not supported
      promise.reject("Not Supported");
    }

    return promise.promise();
  }
});
Cls.initClass();
