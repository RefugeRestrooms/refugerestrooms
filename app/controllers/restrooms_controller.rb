require_relative '../helpers/recaptcha_helper'

class RestroomsController < ApplicationController
  respond_to :html, :json

  before_action :restrooms_filters, only: [:index]
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
    @restroom = Restroom.new(permitted_params)

    # Verify recaptcha code
    recaptcha_response = params['g-recaptcha-response']
    unless RecaptchaHelper.valid_token? recaptcha_response
      flash.now[:error] = I18n.t('helpers.reCAPTCHA.failed')
      render 'new'
      return
    end

    @restroom = SaveRestroom.new(@restroom).call

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
      _vote_for_restroom(:downvote)
    elsif params[:restroom][:upvote]
      _vote_for_restroom(:upvote)
    elsif @restroom.update(permitted_params)
      flash[:notice] = I18n.t('restroom.flash.updated')
    else
      display_errors
      render 'edit'
    end

    redirect_to @restroom
  end

private
  def restrooms_filters
    @filters =
      params
        .fetch(:filters, '')
        .split(',')
        .reduce({}) do |filters, filter|
          filters[filter] = true if ['accessible', 'changing_table', 'unisex'].include?(filter)

          filters
        end
  end

  def list_restrooms
    @restrooms = Restroom.current.where(@filters).page(params[:page])
    @restrooms =
      if params[:search].present? || params[:map] == "1"
        @restrooms.near([params[:lat], params[:long]], 20, :order => 'distance')
      else
        @restrooms.reverse_order
      end

    @restrooms = @restrooms.out_of_range? ? @restrooms.page(1) : @restrooms
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

  def _vote_for_restroom(up_or_downvote)
    if session[:voted_for] and session[:voted_for].include? @restroom.id
      flash[:notice] = I18n.t('restroom.flash.alreadyvoted')
    else
      Restroom.increment_counter(up_or_downvote, @restroom.id)
      session[:voted_for] = session[:voted_for] ? session[:voted_for].push(@restroom.id) : [@restroom.id]
    end
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
