var map;
var ajaxRequest;
var plotlist;
var plotlayers=[];
var GeoSearch;

var myIcon = L.icon({
    iconUrl: 'assets/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    shadowUrl: 'assets/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
});

// Initializes map
function initmap() {
	// set up the map
	map = new L.Map('mapArea');

	// create the tile layer with correct attribution
	var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var osmAttrib='Map data © OpenStreetMap contributors';
	var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});		

	// start the map in San Francisco
	map.setView(new L.LatLng(37.73, -122.46),11);
	map.addLayer(osm);
	
	GeoSearch = new L.Control.GeoSearch({
		provider: new L.GeoSearch.Provider.OpenStreetMap()
	});
	GeoSearch._map = map;
	GeoSearch._processResults = ProcessResults;
	GeoSearch._printError = showError;
}

function ProcessResults(results){
	if (results.length > 0) {
		var marker = L.marker([results[0].Y, results[0].X], {icon: myIcon}).addTo(this._map);
		this._marker = marker;
	}
}

function showError(error){
		alert(error);
}

function setPoint(queryString){
	GeoSearch.geosearch(queryString);
}

// Finds user
function locateUser(){
        map.locate({watch : true});
}
$('#find_me').find('a').on('click', function() {
   locateUser();
});