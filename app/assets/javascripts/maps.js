var map;

function initMap(x, y, image, draggable, callback){
  image = typeof image !== 'undefined' ? image : currentLocationImage;

  // Draggable defaults to false
  draggable =  draggable || false;

  //init map
  var mapOptions = {
    zoom: 15,
    center: new google.maps.LatLng(x, y)
  };

  map = new google.maps.Map(document.getElementById('mapArea'),
      mapOptions);

  google.maps.event.addListenerOnce(map, 'idle', function() {
    $('#mapArea').addClass('loaded');
  });

  //set marker at current location
  var myLatLng = new google.maps.LatLng(x, y);

  var currentLocation = new google.maps.Marker({
    position: myLatLng,
    draggable: draggable,
    map: map,
    icon: image
  });

  currentLocation.addListener("dragend", callback);
}

function getPoint(string, callback){
    // Google Geocoding API
    var url = "http://maps.googleapis.com/maps/api/geocode/json?address=" + string.replace(" ", "+");
    $.get( url, function( data ) {
      if(data && data.results){
        if(data.results.length > 0){
          callback(data.results[0].geometry.location);
        }
      }
    });
}

function placeMarker(lat, lng, content, number){
  // Create Icon
  var circleIcon = {
    url: circleMarkerImage,
    size: new google.maps.Size(37, 37),
    anchor: new google.maps.Point(18.5, 18.5)
  };

  // Create label
  var markerLabel = {
    color: 'white',
    text: number.toString()
  };

  // Create marker
  var marker = new google.maps.Marker({
    position: {lat: lat, lng: lng},
    icon: circleIcon,
    label: markerLabel,
    map: map
  });

  // Create info window
  var infoWindow = new google.maps.InfoWindow({
    content: content
  });

  marker.addListener('click', function() {
    infoWindow.open(map, marker);
  });
}

function generateContent(data){
  var item = $(".listItem[data-id=" + data.id + "]");
  var container = $("<div class='markerPopup' />");
  container.append(item.clone());

  return container[0].outerHTML;
}

function setPoint(data, number){
  if(data.latitude && data.longitude){
    placeMarker(data.latitude, data.longitude, generateContent(data), number);
  }
}

/*
* Geocoding
*/

var currentLocationText = "Current Location";

function searchLocation(search){
  if (search == currentLocationText) {
    searchCurrent();
    return;
  }

  if(search == ""){
    handleSearchResults(37.7577, -122.4376);
    return;
  }

  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({
    'address': search
  }, function (results, status) {
    // if match
    if (status == google.maps.GeocoderStatus.OK) {
      handleSearchResults(results[0].geometry.location.lat(), results[0].geometry.location.lng());
    } else {
      emitError("Geocoder failed due to: " + status);
    }
  });

}

function handleSearchResults(lat, lng){
  $("#lat").val(lat);
  $("#long").val(lng);
  $(".search").find("form").submit();
}

function searchCurrent() {
  var button = $('.currentLocationButton');
  // if we are already searching, don't bother searching again
  if (button.is('currentLocationButtonLocating')) {
    return false;
  }

  button.addClass('currentLocationButtonLocating');

  // We get a promise back from this API
  var location = locator.get();

  // always turn off our "working..." class when we've found it
  location.always(function() {
    button.removeClass('currentLocationButtonLocating');
  });

  location.then(function gotCoordinates(coords) {
    $("#search").val(currentLocationText);
    handleSearchResults(coords.latitude, coords.longitude);
  }, emitError);
}

/*
 * Error Handling
 */

function emitError(error){
  console.error(error.stack || error);
  alert(error.message || error);
}

function guessPosition (coords, callback) {
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({
    'location': new google.maps.LatLng(coords.latitude, coords.longitude)
  }, function (results, status) {
    // if match
    if (status == google.maps.GeocoderStatus.OK) {
      callback(results);
    } else {
      emitError("Geocoder failed due to: " + status);
    }
  });
}

$(function(){
  var $map = $('#mapArea');
  if($map.length > 0) {
    initMap($map.data('latitude'), $map.data('longitude'), showMarkerImage);
  }

  window.Maps = {
    reloadMap: function(map) {
      initMap(map.dataset.latitude, map.dataset.longitude, showMarkerImage);
    },
    reloadDraggable: function(map, callback) {
      initMap(map.dataset.latitude, map.dataset.longitude, showMarkerImage, true, callback);
    }
  }
});
