class RestroomsController < ApplicationController
  respond_to :html, :json

  before_action :list_restrooms, only: [:index]
  before_action :find_restroom, only: [:show, :update, :edit, :destroy]

  def index
    if params[:nearby]
      render :nearby, layout: false
    else
      respond_with @restrooms
    end
  end

  def new
    if params[:edit_id]
      @restroom = find_restroom
      @restroom.edit_id = params[:edit_id]
      @restroom.approved = false
    elsif params[:guess]
      @restroom = Restroom.new(permitted_params)
      @restroom.reverse_geocode
      render 'new', layout: false
    else
      @restroom = Restroom.new
    end
  end

  def create
    restroom = Restroom.new(permitted_params)
    @restroom = SaveRestroom.new(restroom).call

    if @restroom.errors.empty?
      if @restroom.approved?
        flash[:notice] = I18n.t('restroom.flash.new', name: @restroom.name)
        redirect_to @restroom
      else
        flash[:notice] = I18n.t('restroom.flash.edit', name: @restroom.name)
        redirect_to restroom_path(@restroom.edit_id)
      end
    elsif @restroom.errors.key?(:spam)
      flash[:notice] = I18n.t('restroom.flash.spam')
      render 'new'
    else
      display_errors
      render 'new'
    end
  end

  def update
    if params[:restroom][:downvote]
      Restroom.increment_counter(:downvote, @restroom.id)
    elsif params[:restroom][:upvote]
      Restroom.increment_counter(:upvote, @restroom.id)
    elsif @restroom.update(permitted_params)
      flash[:notice] = I18n.t('restroom.flash.updated')
    else
      display_errors
      render 'edit'
    end

    redirect_to @restroom
  end

private
  def list_restrooms
    @restrooms = Restroom.current.page(params[:page])
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
    params.require(:restroom).permit(
      :name,
      :street,
      :city,
      :state,
      :country,
      :accessible,
      :changing_table,
      :unisex,
      :directions,
      :comment,
      :longitude,
      :latitude,
      :edit_id,
      :approved
    )
  end
end
