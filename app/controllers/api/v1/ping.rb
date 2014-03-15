module API
  module V1
    class Ping < Grape::API
      version 'v1'
      format :json

      get :ping do
        { text: 'pong' }
      end
    end
  end
end
