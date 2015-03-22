/*
Place all the behaviors and hooks related to the matching controller here.
All this logic will automatically be available in application.js.
*/
$(function(){
  function URL_add_parameter(url, param, value){
      var hash       = {};
      var parser     = document.createElement('a');

      parser.href    = url;

      var parameters = parser.search.split(/\?|&/);

      for(var i=0; i < parameters.length; i++) {
          if(!parameters[i])
              continue;

          var ary      = parameters[i].split('=');
          hash[ary[0]] = ary[1];
      }

      hash[param] = value;

      var list = [];
      Object.keys(hash).forEach(function (key) {
          list.push(key + '=' + hash[key]);
      });

      parser.search = '?' + list.join('&');
      return parser.href;
  }

  $("#ada_filter").click(function() {
    if ($(this).hasClass("active")) {
      window.location.href = URL_add_parameter(location.href, 'ada', false);
    }
    else {
      window.location.href = URL_add_parameter(location.href, 'ada', true);
    }
  });
  $('#unisex_filter').click(function() {
    if ($(this).hasClass("active")) {
      window.location.href = URL_add_parameter(location.href, 'unisex', false);
    }
    else {
      window.location.href = URL_add_parameter(location.href, 'unisex', true);
    }
  });
});
