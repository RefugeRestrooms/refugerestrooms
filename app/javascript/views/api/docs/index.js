import SwaggerUI from 'swagger-ui'

export default {
  loadSearch() {
    new SwaggerUI({
      url: '/api/swagger_doc.json',
      dom_id: '#swagger-ui-container',
    })
  }
}
