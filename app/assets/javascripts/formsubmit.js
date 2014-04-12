$(function () {
  $("#guess").click(function () {
    getCurrent(function (pos) {
      $('.currentLocationButton').removeClass('currentLocationButtonLocating');

      guessPosition(pos.coords, function (results) {
        if(results && results.length > 0){
          $.ajax({
            type: 'GET',
            url: '/bathrooms/guess',
            data: {bathroom: {latitude: pos.coords.latitude, longitude: pos.coords.longitude}},
            success: function(data, textStatus) {
              $(".form-container").html(data);
              
              $.ajax({
                type: 'GET',
                url: '/bathrooms/nearby',
                data: {search: 'true', lat: pos.coords.latitude, long: pos.coords.longitude},
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
