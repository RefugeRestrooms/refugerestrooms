Refuge.Library.Helpers.URL = {
    addSearchParam: (key, value, url=document.url) ->
      URI(url).addSearch(key, value)

    removeSearchParam: (key, value, url=document.url) ->
      URI(url).removeSearch(key)

    replaceSearchParam: (key, value) ->
      @addSearchParam(key, value, @removeSearchParam(key))

  getParams: ->
    query = window.location.search.substring(1)
    raw_vars = query.split("&")

    params = {}

    for v in raw_vars
      [key, val] = v.split("=")
      params[key] = decodeURIComponent(val)

    params
}
