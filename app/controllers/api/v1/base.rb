# TODO autoloading order changed. This should be managed by configs instead:
# https://guides.rubyonrails.org/v7.0/autoloading_and_reloading_constants.html#autoloading-when-the-application-boots
require_relative 'restrooms'

module API
  module V1
    class Base < Grape::API
      use Rack::JSONP
      mount API::V1::Restrooms

      add_swagger_documentation base_path: '/api', api_version: 'v1', hide_documentation_path: true
    end
  end
end
