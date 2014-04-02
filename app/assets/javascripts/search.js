$(function(){
  var searchDefaultText = "1 Embarcadero Center, San Francisco, CA";
  //Try using google maps search autocomplete
  var input = (document.getElementById('search'));
  var searchBox = new google.maps.places.SearchBox((input));

  var search = $("#search");

  function setDefaultText(element, text){
    //ensure we're not overwriting a value
    if(element.val() == ""){
      element.val(text);
      element.addClass("fadedText");

      //remove effects on focus
      element.focus(function(){
        element.removeClass("fadedText");
        element.val("");

        //when unfocused set back to default if there is no text
        element.blur(function(){setDefaultText(element,text);});
      });
    }
  }

  function preventSearchWithDefault(searchBox){
    //use class to determine if the text has been modified or not
    if(searchBox.hasClass("fadedText") && searchBox.val() == searchDefaultText){
      //set search field back to blank
      searchBox.val("");
    }
  }

  setDefaultText(search, searchDefaultText);

  $(".submitButton").click(function(){
    $(".search").find("form").submit();
  });


  $(".search").find("form").submit(function(event){
    //remove default text on empty search
    preventSearchWithDefault(search);

    if($("#lat").val() == ""
        || $("#long").val() == ""
        || $("#lat").val() == undefined
        || $("#long").val() == undefined
    ){
      event.preventDefault();
      searchLocation(search.val());
    }
  });

  $(".currentLocationButton").click(function(){
      searchCurrent();
  });
});
