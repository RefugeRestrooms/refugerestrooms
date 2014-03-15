module API
  module V1
    class Bathrooms < Grape::API
      include Grape::Kaminari
      paginate :per_page => 10

      version 'v1'
      format :json

      resource :bathrooms do
        desc "Get all bathroom records ordered by date descending."
        get do
          paginate(Bathroom.order(created_at: :desc))
        end

        desc "Perform full-text search of bathroom records."
        params do
          requires :query, type: String, desc: "Your search query."
        end
        get :search do
          paginate(Bathroom.text_search(params[:query]))
        end
      end
    end
  end
end
