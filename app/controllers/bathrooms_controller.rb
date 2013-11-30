class BathroomsController < ApplicationController

  def index
    @bathrooms = Bathroom.all
  end

  def show
    @bathroom = Bathroom.find(params[:id])
  end

  def new
    @bathroom = Bathroom.new
  end

  def create
    @bathroom = Bathroom.new(permitted_params)
    if @bathroom.save
      redirect_to @bathroom
    end
  end

  def update
  end

  def edit
  end

  def destroy
  end

  def delete
  end

  private
  def permitted_params
    params.require(:bathroom).permit!
  end
  
end
