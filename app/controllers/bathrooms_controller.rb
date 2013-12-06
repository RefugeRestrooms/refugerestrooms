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
    @bathroom.flag = 0
    
    if @bathroom.save
      redirect_to @bathroom
    else
      render 'new'
    end
  end

  def update
    @bathroom = Bathroom.find(params[:id])

    if @bathroom.update(permitted_params)
      redirect_to @bathroom
    else
      render 'edit'
    end
  end

  def flag
    @bathroom = Bathroom.find(params[:id])
    @bathroom.flag += 1
    @bathroom.save
  end

  def edit
    @bathroom = Bathroom.find(params[:id])
  end

  def destroy
    :confirm
    @bathroom = Bathroom.find(params[:id])
    @bathroom.destroy
    redirect_to bathrooms_path
  end

  private
  def permitted_params
    params.require(:bathroom).permit!
  end
  
end
