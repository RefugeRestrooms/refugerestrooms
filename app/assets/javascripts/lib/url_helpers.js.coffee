Refuge.Library.Helpers.URL = {
    addSearchParameter: (key, value, url=document.url) ->
      URI(url).addSearch(key, value)

    removeSearchParameter: (key, value, url=document.url) ->
      URI(url).removeSearch(key)

    replaceSearchParameter: (key, value) ->
      @addSearchParameter(key, value, @removeSearchParameter(key))
}
