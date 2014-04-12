$(function () {
  $("#guess").click(function () {
    getCurrent(function (pos) {
      $('.currentLocationButton').removeClass('currentLocationButtonLocating');

      guessPosition(pos.coords, function (results) {
        if(results && results.length > 0){
          $.ajax({
            type: 'GET',
            url: '/bathrooms/new',
            data: {guess: true, bathroom: {latitude: pos.coords.latitude, longitude: pos.coords.longitude}},
            success: function(data, textStatus) {
              $(".form-container").html(data);
              
              $.ajax({
                type: 'GET',
                url: '/bathrooms',
                data: {search: 'true', nearby: true, lat: pos.coords.latitude, long: pos.coords.longitude},
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
