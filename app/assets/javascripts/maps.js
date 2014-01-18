var map;

function initMap(){
	

  var mapOptions = {
    zoom: 11,
    center: new google.maps.LatLng(37.8, -122.4)
  };
  map = new google.maps.Map(document.getElementById('mapArea'),
      mapOptions);
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
	var marker=new google.maps.Marker({
	  position:new google.maps.LatLng(lat,lng),
	  });

	marker.setMap(map);
	
	var infowindow = new google.maps.InfoWindow({
	  content:content
	  });

	google.maps.event.addListener(marker, 'click', function() {
	  infowindow.open(map,marker);
	  });
}

function generateContent(data){
console.log(data);
var string = "<a href='bathrooms/"
	+ data.id
	+"'>"
	+ data.street
	+ "</a>";
	
	return string;
}

function setPoint(data){

	var string = new String(data.street + " " + data.city + " " + data.state);
	
	getPoint(string, function(point){
		placeMarker(point.lat, point.lng, generateContent(data));
	});
}