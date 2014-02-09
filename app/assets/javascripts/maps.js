var map;

function initMap(x, y, image){
	image = typeof image !== 'undefined' ? image : currentLocationImage;
	
	//init map
  var mapOptions = {
    zoom: 15,
    center: new google.maps.LatLng(x, y)
  };

  map = new google.maps.Map(document.getElementById('mapArea'),
      mapOptions);

	  //set marker at current location
	  var myLatLng = new google.maps.LatLng(x, y);
	  
	  var currentLocation = new google.maps.Marker({
		  position: myLatLng,
		  map: map,
		  icon: image
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

function placeMarker(lat, lng, content, number){

	//create popup
	var infowindow = new google.maps.InfoWindow({
	  content:content
	  });

	//create marker
	var marker = new numberedCircle(new google.maps.LatLng(lat,lng), circleMarkerImage, number, map, infowindow);
	
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

function setPoint(data, number){
	if(data.latitude && data.longitude){
		placeMarker(data.latitude, data.longitude, generateContent(data), number);
	}
}


/*
* Create a new marker that allows text
*/
numberedCircle.prototype = new google.maps.OverlayView();

function numberedCircle(center, image, text, map, infoWindow) {

	// Initialize all properties.
	this.center_ = center;
	this.image_ = image;
	this.text_ = text;
	this.map_ = map;
	this.infoWindow_ = infoWindow;

	// this will hold the div displayed on the map
	this.div_ = null;

	// Place on map
	this.setMap(map);
}

numberedCircle.prototype.onAdd = function() {
	var me = this;

	//generate the content
	var div = document.createElement('div');
	div.style.borderStyle = 'none';
	div.style.borderWidth = '0px';
	div.style.position = 'absolute';
	div.className = "numberCircle";
	div.onclick = function(){
		me.infoWindow_.open(map);
		me.infoWindow_.setPosition(me.center_);
	}
	
	var img = document.createElement('img');
	img.src = this.image_;
	img.style.position = 'absolute';
	div.appendChild(img);
	
	var textDiv = document.createElement('div');
	textDiv.style.position = 'absolute';
	textDiv.style.top = 0;
	textDiv.style.left = 0;
	textDiv.style.width = '100%';
	textDiv.style.height = '100%';
	textDiv.innerHTML = this.text_;
	div.appendChild(textDiv);

	this.div_ = div;

	// Add the element to the "overlayLayer" pane.
	var panes = this.getPanes();
	panes.overlayMouseTarget.appendChild(div);
};

numberedCircle.prototype.draw = function() {

	// retrieve the projection from the overlay.
	var overlayProjection = this.getProjection();

	// convert the lat/lng to pixel units
	var center = overlayProjection.fromLatLngToDivPixel(this.center_);

	//get image for size calculations
	var div = this.div_;
	var image = div.getElementsByTagName("IMG")[0];
	
	//detect if image has loaded yet or not (we can't get the size until it's loaded)
	if(image.width == 0){
		//set div's location, only thing we can do until image loads
		div.style.left = center.x + 'px';
		div.style.top = center.y + 'px';
		
		image.onload = function(){
			var parent = this.parentNode;
			//offset the parent div so that the image is centered
			parent.style.left = (parent.offsetLeft - (this.width / 2)) + 'px';
			parent.style.top = (parent.offsetTop - (this.height / 2)) + 'px';
			parent.style.width = this.width + 'px';
			parent.style.height = this.height + 'px';
		}
	}else{
		//the image is loaded so we can easily access the size
		//offset the div so that the image is centered
		if(map.getZoom() <= 14){
			image.width = image.naturalWidth / 2;
		}else{
			image.width = image.naturalWidth;
		}
		div.style.left = (center.x - (image.width / 2)) + 'px';
		div.style.top = (center.y - (image.height / 2)) + 'px';
		div.style.width = image.width + 'px';
		div.style.height = image.height + 'px';
		
		//adjust line-height to center text
		div.getElementsByTagName("DIV")[0].style.lineHeight = image.height + 'px';
	}
  
};

numberedCircle.prototype.onRemove = function() {
  this.div_.parentNode.removeChild(this.div_);
  this.div_ = null;
};

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
		  alert("Geocoder failed due to: " + status);
	  }
	});

}

function handleSearchResults(lat, lng){
	$("#lat").val(lat);
	$("#long").val(lng);
	console.log(lat);
	console.log(lng);
	$(".search").find("form").submit();
}

function searchCurrent(){
          if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(function (pos) {

                  // set map
		  console.log("lat: %s , long: %s", pos.coords.latitude, pos.coords.longitude);
		  $("#search").val(currentLocationText);
                  handleSearchResults(pos.coords.latitude, pos.coords.longitude);

              }, function (error) {
                  alert("Location dectection failed due to:" + error);
              });
          }else{
		alert("Unable to aquire current location");
	  }
}