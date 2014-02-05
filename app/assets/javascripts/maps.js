var map;

function initMap(x, y){

	//init map
  var mapOptions = {
    zoom: 13,
    center: new google.maps.LatLng(x, y)
  };

  map = new google.maps.Map(document.getElementById('mapArea'),
      mapOptions);

	  //set marker at current location
	  var myLatLng = new google.maps.LatLng(x, y);
	  var currentLocation = new google.maps.Marker({
		  position: myLatLng,
		  map: map,
		  icon: currentLocationImage
	  });
}


function getPoint(string, callback){


		//google Geocoding API
		var url = "http://maps.googleapis.com/maps/api/geocode/json?address=" + string.replace(" ", "+") + "&sensor=false";
		$.get( url, function( data ) {
			if(data && data.results){
				if(data.results.length > 0){
					callback(data.results[0].geometry.location);
				}
			}
		});
}

function placeMarker(lat, lng, content){
	//create marker
	var marker=new google.maps.Marker({
	  position:new google.maps.LatLng(lat,lng),
	  });

	//put marker on map
	marker.setMap(map);

	//create popup
	var infowindow = new google.maps.InfoWindow({
	  content:content
	  });

	//linke popup to marker
	google.maps.event.addListener(marker, 'click', function() {
	  infowindow.open(map,marker);
	  });
}

function generateContent(data){
var string = data.name
	+ "<br/><a href='bathrooms/"
	+ data.id
	+"'>"
	+ data.street
	+ "</a>";

	return string;
}

function setPoint(data){
	if(data.latitude && data.longitude){
		placeMarker(data.latitude, data.longitude, generateContent(data));
	}
}