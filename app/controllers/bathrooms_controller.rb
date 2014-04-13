class BathroomsController < ApplicationController
  respond_to :html, :json

  helper :bathrooms

  before_filter :list_bathrooms, only: [:index]
  before_filter :find_bathroom, only: [:show, :update, :edit, :destroy]

  def index
    if params[:nearby]
      render :nearby, layout: false
    else
      respond_with @bathrooms
    end
  end

  def new
    if params[:guess]
      @bathroom = Bathroom.new(permitted_params)
      @bathroom.reverse_geocode
      render 'new', layout: false
    else
      @bathroom = Bathroom.new
    end
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
    if params[:bathroom][:downvote]
      Bathroom.increment_counter(:downvote, @bathroom.id)
    elsif params[:bathroom][:upvote]
      Bathroom.increment_counter(:upvote, @bathroom.id)
    elsif @bathroom.update(permitted_params)
      flash[:notice] = I18n.t('bathroom.flash.updated')
    else
      display_errors
      render 'edit'
    end

    redirect_to @bathroom
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
