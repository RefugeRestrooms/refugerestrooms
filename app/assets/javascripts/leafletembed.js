var map;
var ajaxRequest;
var plotlist;
var plotlayers=[];

// Initializes map
function initmap() {
	// set up the map
	map = new L.Map('mapArea');

	// create the tile layer with correct attribution
	var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var osmAttrib='Map data © OpenStreetMap contributors';
	var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});		

	// start the map in South-East England
	map.setView(new L.LatLng(40.67, -73.94),12);
	map.addLayer(osm);
}

// Finds user
function locateUser(){
        map.locate({watch : true});
}
$('#find_me').find('a').on('click', function() {
   locateUser();
});