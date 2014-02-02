class BathroomsController < ApplicationController

  def index

    @bathrooms = Bathroom.ada(params[:adafilter]).unisex(params[:unisexfilter])

    if params[:search].present?
      @bathrooms = @bathrooms.near(params[:search], 20, :order => 'distance')
    else
      @bathrooms.reverse!
      @bathrooms.limit(20)
    end


  end

	def list

    @bathrooms = Bathroom.ada(params[:adafilter]).unisex(params[:unisexfilter])

    if params[:search].present?
      @bathrooms = @bathrooms.near(params[:search], 20)
    else
      @bathrooms = @bathrooms.limit(20)
    end

		render json: @bathrooms
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
      flash[:notice] = "A new bathroom entry has been created for #{@bathroom.name}."
      redirect_to @bathroom
    else
      flash[:alert] = "There was a problem saving your entry to the database."
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

  def down_vote
    @bathroom = Bathroom.find(params[:id])
    @bathroom.downvote += 1
    if @bathroom.save
      flash[:notice] = "This bathroom has been downvoted! Thank you for contributing to our community. "
      redirect_to @bathroom
    else
      flash[:alert] = "There was an unexpected problem downvoting this post."
      redirect_to @bathroom
    end
  end

  def up_vote
    @bathroom = Bathroom.find(params[:id])
    @bathroom.upvote += 1
    if @bathroom.save
      flash[:notice] = "This bathroom has been upvoted! Thank you for contributing to our community. "
      redirect_to @bathroom
    else
      flash[:alert] = "There was an unexpected problem upvoting this post."
      redirect_to @bahtroom
    end
  end


  def edit
    @bathroom = Bathroom.find(params[:id])
  end

  def destroy
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
