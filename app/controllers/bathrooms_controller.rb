class BathroomsController < ApplicationController

  before_filter :encode_search, only: :index
  before_filter :list_bathrooms, only: [:index, :list]
  before_filter :find_bathroom, only: [:show, :update, :edit, :destroy, :up_vote, :down_vote]

  def index
  end

	def list
		render json: @bathrooms
	end

  def show
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
    if @bathroom.update(permitted_params)
      flash[:notice] = "This bathroom entry has been updated."
      redirect_to @bathroom
    else
      flash[:alert] = "There was an unexpected problem updating this post."
      render 'edit'
    end
  end

  def edit
  end

  def destroy
    if @bathroom.destroy
      flash[:notice] = "This bathroom entry has been deleted."
      redirect_to bathrooms_path
    else
      flash[:alert] = "This bathroom entry could not be deleted."
      redirect_to @bathroom
    end
  end

  def down_vote
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
    @bathroom.upvote += 1
    if @bathroom.save
      flash[:notice] = "This bathroom has been upvoted! Thank you for contributing to our community. "
      redirect_to @bathroom
    else
      flash[:alert] = "There was an unexpected problem upvoting this post."
      redirect_to @bathroom
    end
  end


  private

  def list_bathrooms
    @bathrooms = Bathroom.ada(params[:adafilter]).unisex(params[:unisexfilter])

    @bathrooms = if params[:search].present? || params[:map] == "1"
      @bathrooms.near([params[:lat], params[:long]], 20, :order => 'distance')
    else
      @bathrooms.reverse_order
    end

    @bathrooms = @bathrooms.limit(20)
  end

  def find_bathroom
    @bathroom = Bathroom.find(params[:id])
  end

  def permitted_params
    params.require(:bathroom).permit!
  end

  def encode_search
    # The case where the search parameter is populated, but the lat and long
    # parameters are blank, has to be handled on the client side, so does not
    # appear here.

    # Normalize the search query a bit.
    case params[:search]
    when /(-?[\d.]+), *(-?[\d.]+)/
      # If someone searches with latitude and longitude, populate the lat/long params.
      params[:lat], params[:long] = [$1, $2]

    when ''
      if params[:lat].blank? && params[:long].blank?
        # If all of the search, lat, and long parameters are blank,
        # redirect to the homepage.
        redirect_to '/'

      elsif !params[:lat].blank? && !params[:long].blank?
        # If lat/long parameters are populated, but the search parameter is not,
        # set the search parameter to "<lat>, <long>"
        params[:search] = "#{params[:lat]}, #{params[:long]}"

      else
        # The search parameter is empty, but only *one* of the latitude or
        # longitude parameters is blank.
        # We can't really recover from this, so redirect to the homepage and
        # show an error.

        params.delete(:lat)
        params.delete(:long)

        error = "There was an error searching for your location."
        redirect_to url_for(params), flash: {error: error}
      end
    end
  end

end
