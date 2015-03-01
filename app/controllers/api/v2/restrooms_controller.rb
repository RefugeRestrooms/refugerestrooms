module API
  module V2
    class Api::V2::RestroomsController < ApplicationController
      protect_from_forgery with: :null_session

      before_filter :list_restrooms, only: [:index]
      before_filter :find_restroom, only: [:show, :update]

      def index
        render json: @restrooms
      end

      def show
        render json: @restroom
      end

      def update
        if params[:restroom][:downvote]
          if Restroom.increment_counter(:downvote, @restroom.id)
            render json: {status: 200, message: "#{@restroom.name} has been sucessfully downvoted!"}
          end
        elsif params[:restroom][:upvote]
          if Restroom.increment_counter(:upvote, @restroom.id)
            render json: {status: 200, message: "#{@restroom.name} has been sucessfully upvoted!"}
          end
        else
          render json: {status: 501, message: "Not Implemented"}
        end
      end

      def create
        @restroom = Restroom.new(creation_params)
        if @restroom.spam?
          render status: 400
        elsif @restroom.save
          render status: 201, json: @restroom
        else
          render status: 500
        end
      end

      private

      def find_restroom
        @restroom = Restroom.find(params[:id])
      end

      def list_restrooms
        @restrooms = Restroom.all
        @restrooms = if params[:lat].present? && params[:long].present?
          @restrooms.near([params[:lat], params[:long]], 20, :order => 'distance')
        elsif params[:search].present?
          @restrooms.text_search(params[:search])
        else
          @restrooms.reverse_order
        end
      end

      def creation_params
        required_params = [
          :name,
          :street,
          :city,
          :state,
          :country,
          :accessible,
          :unisex,
        ]

        optional_params = [
          :comment,
          :directions,
        ]

        required_params.each { |param| params.require(param) }

        params.permit(required_params + optional_params)
      end

      def permitted_params
        params.require(:restroom).permit(:upvote, :downvote)
      end
    end
  end
end
