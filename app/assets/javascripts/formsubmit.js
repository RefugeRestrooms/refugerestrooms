$(function () {
  $("#guess").click(function () {
    $("#guess").toggleClass('locating');

    locator.get().then(function (coords) {
      $('.currentLocationButton').removeClass('currentLocationButtonLocating');

      guessPosition(coords, function (results) {
        if(results && results.length > 0){
          $.ajax({
            type: 'GET',
            url: '/restrooms/new',
            data: {guess: true, restroom: {latitude: coords.latitude, longitude: coords.longitude}},
            success: function(data, textStatus) {
              $(".form-container").html(data);

              $.ajax({
                type: 'GET',
                url: '/restrooms',
                data: {search: 'true', nearby: true, lat: coords.latitude, long: coords.longitude},
                success: function(data, textStatus) {
                  $('#nearby').html(data);
                }
              });
            }
          })
        }
      });
    })
  });
});
