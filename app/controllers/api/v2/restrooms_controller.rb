module API
  module V2
    class Api::V2::RestroomsController < ApplicationController

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

      def permitted_params
        params.require(:restroom).permit(:upvote, :downvote)
      end
    end
  end
end