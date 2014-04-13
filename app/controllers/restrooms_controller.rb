class RestroomsController < ApplicationController
  respond_to :html, :json

  helper :restrooms

  before_filter :list_restrooms, only: [:index]
  before_filter :find_restroom, only: [:show, :update, :edit, :destroy, :up_vote, :down_vote]

  def index
    if params[:nearby]
      render :nearby, layout: false
    else
      respond_with @restrooms
    end
  end

  def guess
  end

  def new
    if params[:guess]
      @restroom = Restroom.new(permitted_params)
      @restroom.reverse_geocode
      render 'new', layout: false
    else
      @restroom = Restroom.new
    end
  end

  def create
    @restroom = Restroom.new(permitted_params)

    if @restroom.save
      flash[:notice] = I18n.t('restroom.flash.new', name: @restroom.name)
      redirect_to @restroom
    else
      display_errors
      render 'new'
    end
  end

  def update
    if @restroom.update(permitted_params)
      flash[:notice] = I18n.t('restroom.flash.updated')
      redirect_to @restroom
    else
      display_errors
      render 'edit'
    end
  end

  def destroy
    if @restroom.destroy
      flash[:notice] = I18n.t('restroom.flash.deleted')
      redirect_to restrooms_path
    else
      display_errors
      redirect_to @restroom
    end
  end

private
  def list_restrooms
    @restrooms = Restroom.all.page(params[:page])

    @restrooms = if params[:search].present? || params[:map] == "1"
      @restrooms.near([params[:lat], params[:long]], 20, :order => 'distance')
    else
      @restrooms.reverse_order
    end
  end

  def display_errors
    if @restroom.errors.any?
      errors = @restroom.errors.each do |attribute, message|
        flash[:alert] = I18n.t('restroom.flash.field')
      end
    else
      flash[:alert] = I18n.t('restroom.flash.unexpected')
    end
  end

  def find_restroom
    @restroom = Restroom.find(params[:id])
  end

  def permitted_params
    if params[:restroom][:downvote]
      params[:restroom][:downvote] = @restroom.downvote + 1
    elsif params[:restroom][:upvote]
      params[:restroom][:upvote] = @restroom.upvote + 1
    end

    params.require(:restroom).permit!
  end
end
