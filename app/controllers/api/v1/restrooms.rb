module API
  module V1
    class Restrooms < Grape::API
      helpers Grape::Pagy::Helpers

      version 'v1'
      format :json

      # rubocop:disable Metrics/BlockLength
      resource :restrooms do
        desc "Get all restroom records ordered by date descending."
        params do
          use :pagy,
              items_param: :per_page,
              items: 10,
              max_items: 100
          optional :ada, type: Boolean, desc: "Only return restrooms that are ADA accessible."
          optional :unisex, type: Boolean, desc: "Only return restrooms that are unisex."
        end
        get do
          r = Restroom
          r = r.current
          r = r.accessible if params[:ada].present?
          r = r.unisex if params[:unisex].present?

          pagy(r.order(created_at: :desc))
        end

        desc "Perform full-text search of restroom records."
        params do
          use :pagy,
              items_param: :per_page,
              items: 10,
              max_items: 100
          optional :ada, type: Boolean, desc: "Only return restrooms that are ADA accessible."
          optional :unisex, type: Boolean, desc: "Only return restrooms that are unisex."
          requires :query, type: String, desc: "Your search query."
        end
        get :search do
          r = Restroom
          r = r.current
          r = r.accessible if params[:ada].present?
          r = r.unisex if params[:unisex].present?

          pagy(r.text_search(params[:query]))
        end

        desc "Search by location."
        params do
          use :pagy,
              items_param: :per_page,
              items: 10,
              max_items: 100
          optional :ada, type: Boolean, desc: "Only return restrooms that are ADA accessible."
          optional :unisex, type: Boolean, desc: "Only return restrooms that are unisex."
          requires :lat, type: Float, desc: "latitude"
          requires :lng, type: Float, desc: "longitude"
        end
        get :by_location do
          r = Restroom
          r = r.current
          r = r.accessible if params[:ada].present?
          r = r.unisex if params[:unisex]
          pagy(r.near([params[:lat], params[:lng]], 20, order: 'distance'))
        end

        desc "Search for restroom records updated or created on or after a given date"
        params do
          use :pagy,
              items_param: :per_page,
              items: 10,
              max_items: 100
          optional :ada, type: Boolean, desc: "Only return restrooms that are ADA accessible."
          optional :unisex, type: Boolean, desc: "Only return restrooms that are unisex."
          optional(
            :updated,
            type: Boolean,
            desc: "Return restroom records updated (rather than created) since given date"
          )
          requires :day, type: Integer, desc: "Day"
          requires :month, type: Integer, desc: "Month"
          requires :year, type: Integer, desc: "Year"
        end
        get :by_date do
          r = Restroom
          r = r.current
          date = Date.new(params[:year], params[:month], params[:day])
          r = if params[:updated]
                r.updated_since(date)
              else
                r.created_since(date)
              end
          r = r.accessible if params[:ada].present?
          r = r.unisex if params[:unisex].present?
          pagy(r.order(created_at: :desc))
        end
      end
      # rubocop:enable Metrics/BlockLength
    end
  end
end
