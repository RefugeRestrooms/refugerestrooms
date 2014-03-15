module API
  module V1
    class Hello < Grape::API
      version 'v1'
      format :json

      get :hello do
        { text: 'Hello from API version 1!' }
      end
    end
  end
end
