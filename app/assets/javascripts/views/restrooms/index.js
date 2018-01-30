$(function(){
  var headerHidden = false;
  var mapOn = false;
  var mapShow = false;
  var mapHeight, listHeight;
  var mapContainer = $("#mapContainer");
  var list = $("#list");
  var mapToggle = $(".mapToggle");
  var search = $("#search");

  function toggleMap (){
    if (mapShow) {
      mapToggle.html("Map View");
      //animate
      scrollUp(mapContainer, function(){scrollDown(list, listHeight);});
    }else{
      mapToggle.html("List View");
      //animate
      scrollUp(list, function(){scrollDown(mapContainer, mapHeight, doInit);});
    }
    mapShow = !mapShow;
  }

  function scrollDown(object, height, callback){
    object.show();
    object.animate({height: height}, 1000, function(){
      if (callback) {
        callback();
      }
    });
  }

  function scrollUp(object, callback){
    object.animate({height: 0}, 1000, function(){
      object.hide();
      if (callback) {
        callback();
      }
    })
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
    //get default height for animation later
    mapHeight = mapContainer.height();
    listHeight = list.height();

    //hide the map
    mapContainer.hide();
    mapContainer.height(0);

    mapToggle.click(function(){
      //toggle which display is open
      toggleMap();
    });
  }
});
