var Map = function() {
	this.mapOn = false;
  this.mapShow = false;
	this.mapContainer = $("#mapContainer");
	this.list = $("#list");
  this.mapFilter = $("#map_filter");
  this.listFilter = $("#list_filter");
	this.search = $("#search");

	if (this.mapContainer.length > 0 && this.list.length > 0 && this.mapFilter.length > 0) {
		if (!this.mapContainer.data('latitude') || !this.mapContainer.data('longitude')) {
			//catch bad URL
			searchLocation(this.search.val());
		}
		//get default height for animation later
		this.mapHeight = this.mapContainer.height();
		this.listHeight = this.list.height();

		//hide the map
		this.mapContainer.hide();
		this.mapContainer.height(0);
  }
};

Map.prototype.doInit = function(){
  //initialize the map if it wasn't already on
  if (!this.mapOn && this.mapContainer.data('latitude') && this.mapContainer.data('longitude')) {
    initMap(this.mapContainer.data('latitude'), this.mapContainer.data('longitude'));

    //get a list of points from the server based on the searched location
    $.get( '/restrooms' + window.location.search , {}, function( data ) {
      for(var i = 0; i < data.length; i++){
      //for each point in the data, put a point on the map
      setPoint(data[i], i + 1);
      }
    }, 'json');
    this.mapOn = true;
  }
};

Map.prototype.scrollDown = function(object, height, callback){
  object.show();
  object.animate({height: height}, 1000, function(){
    if (callback) {
      callback();
    }
  });
};

Map.prototype.scrollUp = function(object, callback){
  object.animate({height: 0}, 1000, function(){
    object.hide();
    if (callback) {
      callback();
    }
  })
};

Map.prototype.toggleMap = function(){
  var obj = this;
  if (this.mapShow) {
    this.scrollUp(
      this.mapContainer,
      function(){obj.scrollDown(obj.list, obj.listHeight)}
    );
  }else{
    this.scrollUp(
      this.list,
      function(){obj.scrollDown(obj.mapContainer, obj.mapHeight, function(){obj.doInit})}
    );
  }
  this.mapShow = !this.mapShow
};

Map.prototype.updateButtons = function(click_type) {
  if (click_type == 'list') {
    if (this.mapFilter.hasClass('active')) {
      this.mapFilter.removeClass('active');
    } else {
      this.mapFilter.addClass('active');
    }
  }
  if (click_type == 'map') {
    if (this.listFilter.hasClass('active')) {
      this.listFilter.removeClass('active');
    } else {
      this.listFilter.addClass('active');
    }
  }
};

$(function(){
    var map = new Map();
    map.doInit();
		$("#map_filter").click(function(){
      map.updateButtons('map');
      map.toggleMap();
    });

		$("#list_filter").click(function(){
      map.updateButtons('list');
      map.toggleMap();
		});
	}
);
