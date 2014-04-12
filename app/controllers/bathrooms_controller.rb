class BathroomsController < ApplicationController
  helper :bathrooms

  before_filter :list_bathrooms, only: [:index, :list, :nearby]
  before_filter :find_bathroom, only: [:show, :update, :edit, :destroy, :up_vote, :down_vote]

	def list
		render json: @bathrooms
	end

  def nearby
    render layout: false
  end

  def guess
    @bathroom = Bathroom.new(permitted_params)
    @bathroom.reverse_geocode
    render 'new', layout: false
  end

  def new
    @bathroom = Bathroom.new
  end

  def create
    @bathroom = Bathroom.new(permitted_params)

    if @bathroom.save
      flash[:notice] = I18n.t('bathroom.flash.new', name: @bathroom.name)
      redirect_to @bathroom
    else
      display_errors
      render 'new'
    end
  end

  def update
    if @bathroom.update(permitted_params)
      flash[:notice] = I18n.t('bathroom.flash.updated')
      redirect_to @bathroom
    else
      display_errors
      render 'edit'
    end
  end

  def destroy
    if @bathroom.destroy
      flash[:notice] = I18n.t('bathroom.flash.deleted')
      redirect_to bathrooms_path
    else
      display_errors
      redirect_to @bathroom
    end
  end

  def down_vote
    if @bathroom.update_attributes downvote: @bathroom.downvote + 1
      flash[:notice] = I18n.t('bathroom.flash.downvotesuccess')
    else
      flash[:alert] = I18n.t('bathroom.flash.downvoteerror')
    end
    redirect_to @bathroom
  end

  def up_vote
    if @bathroom.update_attributes upvote: @bathroom.upvote + 1
      flash[:notice] = I18n.t('bathroom.flash.upvotesucess')
    else
      flash[:alert] = I18n.t('bathroom.flash.upvoteerror')
    end
    redirect_to @bathroom
  end

private

  def list_bathrooms
    @bathrooms = Bathroom.all.page(params[:page])

    @bathrooms = if params[:search].present? || params[:map] == "1"
      @bathrooms.near([params[:lat], params[:long]], 20, :order => 'distance')
    else
      @bathrooms.reverse_order
    end
  end

  def display_errors
    if @bathroom.errors.any?
      errors = @bathroom.errors.each do |attribute, message|
        flash[:alert] = I18n.t('bathroom.flash.field')
      end
    else
      flash[:alert] = I18n.t('bathroom.flash.unexpected')
    end
  end

  def find_bathroom
    @bathroom = Bathroom.find(params[:id])
  end

  def permitted_params
    params.require(:bathroom).permit!
  end

end
