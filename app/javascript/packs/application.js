// Vendor
require('@rails/ujs').start()
require('jquery')
import 'bootstrap/dist/js/bootstrap'

// Views
import './views/restrooms/index'
import './views/restrooms/new'
import './views/restrooms/restrooms'
import './views/restrooms/search'
import ApiDocs from './views/api/docs'

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('swagger-ui-container') != null ) { ApiDocs.loadSearch() }
})
