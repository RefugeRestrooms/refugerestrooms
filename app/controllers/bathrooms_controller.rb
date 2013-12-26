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
      flash[:notice] = "A new bathroom entry has been created for #{@bathroom.title}."
      redirect_to @bathroom
    else
      flash[:alert] = "There was a problem saving your entery to the database."
      render 'new'
    end
  end

  def update
    @bathroom = Bathroom.find(params[:id])

    if @bathroom.update(permitted_params)
      flash[:notice] = "This bathroom entry has been updated."
      redirect_to @bathroom
    else
      flash[:alert] = "There was an unexpected problem updating this post."
      render 'edit'
    end
  end

  def flag
    @bathroom = Bathroom.find(params[:id])
    @bathroom.flags += 1
    if @bathroom.save
      flash[:notice] = "This bathroom has been flagged as a \"bad entry!\" Thank you for contributing to our community. "
      redirect_to @bathroom
    else
      flash[:alert] = "There was an unexpected problem flagging this post."
      redirect_to @bathroom
    end
  end

  def edit
    @bathroom = Bathroom.find(params[:id])
  end

  def destroy
    :confirm
    @bathroom = Bathroom.find(params[:id])
    if @bathroom.destroy
      flash[:notice] = "This bathroom entry has been deleted."
      redirect_to bathrooms_path
    else
      flash[:alert] = "This bathroom entry could not be deleted."
      redirect_to @bathroom
    end
    
  end

  private
  def permitted_params
    params.require(:bathroom).permit!
  end
  
end
