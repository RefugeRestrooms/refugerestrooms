module API
  module V1
    class Bathrooms < Grape::API
      include Grape::Kaminari
      paginate :per_page => 10

      version 'v1'
      format :json

      resource :bathrooms do
        desc "Get all bathroom records ordered by date descending."
        params do
          optional :ada, type: Boolean, desc: "Only return bathrooms that are ADA accessible."
          optional :unisex, type: Boolean, desc: "Only return bathrooms that are unisex."
        end
        get do
          b = Bathroom
          b = b.where(access: 1) if params[:ada] === true
          b = b.where(bath_type: 0) if params[:unisex] === true

          paginate(b.order(created_at: :desc))
        end

        desc "Perform full-text search of bathroom records."
        params do
          optional :ada, type: Boolean, desc: "Only return bathrooms that are ADA accessible."
          optional :unisex, type: Boolean, desc: "Only return bathrooms that are unisex."
          requires :query, type: String, desc: "Your search query."
        end
        get :search do
          b = Bathroom
          b = b.where(access: 1) if params[:ada] === true
          b = b.where(bath_type: 0) if params[:unisex] === true

          paginate(b.text_search(params[:query]))
        end
      end
    end
  end
end
