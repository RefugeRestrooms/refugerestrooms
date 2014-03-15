module API
  module V1
    class Base < Grape::API
      mount API::V1::Ping
      mount API::V1::Hello
    end
  end
end
