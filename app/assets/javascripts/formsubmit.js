$(function () {
  $("#guess").click(function () {
    getCurrent(function (pos) {
      $.ajax({
        type: 'GET',
        url: '/bathrooms/nearby',
        data: {search: 'true', lat: pos.coords.latitude, long: pos.coords.longitude},
        success: function(data, textStatus) {
          $('#nearby').html(data);
        }
      });

      $('.currentLocationButton').removeClass('currentLocationButtonLocating');
      guessPosition(pos.coords, function (results) {
        if(results && results.length > 0){
          var addressArray = results[0].address_components;
          $("#bathroom_street").val(addressArray[0].long_name + " " + addressArray[1].long_name);
          $("#bathroom_city").val(addressArray[3].long_name);
          $("#bathroom_state").val(addressArray[5].long_name);
          $("#bathroom_country").find("option[value='" + addressArray[6].long_name + "'']").prop('selected', true);
          $("#bathroom_name").val(results[0].formatted_address);
        }
      });
    })
  });
});
