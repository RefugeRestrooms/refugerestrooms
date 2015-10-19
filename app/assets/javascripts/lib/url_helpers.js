Refuge.Library.Helpers.URL = {
  addSearchParam: function(key, value, url) {
    if (url == null) {
      url = document.url;
    }
    return URI(url).addSearch(key, value);
  },
  removeSearchParam: function(key, value, url) {
    if (url == null) {
      url = document.url;
    }
    return URI(url).removeSearch(key);
  },
  replaceSearchParam: function(key, value) {
    return this.addSearchParam(key, value, this.removeSearchParam(key));
  },
  getParams: function() {
    var query = window.location.search.substring(1);
    var raw_vars = query.split("&");
    var params = {};
    for (var i = 0; i < raw_vars.length; i++) {
      var v = raw_vars[i].split("=");
      params[v[0]] = decodeURIComponent(v[1]);
    }
    return params;
  }
};
