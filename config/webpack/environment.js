const { environment } = require('@rails/webpacker')

// jQuery
const webpack = require('webpack')
environment.plugins.prepend('Provide',
  new webpack.ProvidePlugin({
    $: 'jquery/src/jquery',
    jQuery: 'jquery/src/jquery'
  })
)

// rails-erb-loader
const erb =  require('./loaders/erb')
environment.loaders.append('erb', erb)

module.exports = environment
