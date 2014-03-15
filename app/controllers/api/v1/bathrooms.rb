module API
  module V1
    class Bathrooms < Grape::API
      version 'v1'
      format :json

      resource :bathrooms do
        desc "Get all bathroom records ordered by date descending."
        get do
          Bathroom.order(created_at: :desc)
        end

        desc "Search bathroom records."
        params do
          requires :query, type: String, desc: "Your search query."
        end
        get :search do
          Bathroom.text_search(params[:query])
        end
      end
    end
  end
end
