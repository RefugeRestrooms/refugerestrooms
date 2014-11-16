$(function(){
	var ANIMATE_DURATION = 250;
	var headerHidden = false;
	var mapOn = false;
	var mapShow = false;
	var mapContainer = $("#mapContainer");
	var list = $("#list");
	var mapToggle = $(".mapToggle");
	var search = $("#search");

	function toggleMap() {
		mapShow = !mapShow;
		var callback = mapShow ? doInit : $.noop;
		mapContainer.stop().slideToggle(ANIMATE_DURATION, callback);
		list.stop().slideToggle(ANIMATE_DURATION);
		mapToggle.text(mapShow ? 'List View' : 'Map View');
	}

	function doInit(){
		//initialize the map if it wasn't already on
		if (!mapOn && mapContainer.data('latitude') && mapContainer.data('longitude')) {
			initMap(mapContainer.data('latitude'), mapContainer.data('longitude'));

			//get a list of points from the server based on the searched location
			$.get( '/restrooms' + window.location.search , {}, function( data ) {
			  for(var i = 0; i < data.length; i++){
				//for each point in the data, put a point on the map
				setPoint(data[i], i + 1);
			  }
			}, 'json');
			mapOn = true;
		}
	}


	if (mapContainer.length > 0 && list.length > 0 && mapToggle.length > 0) {
		if (!mapContainer.data('latitude') || !mapContainer.data('longitude')) {
			//catch bad URL
			searchLocation(search.val());
		}

		mapContainer.hide();
		mapToggle.click(toggleMap);
	}
});
