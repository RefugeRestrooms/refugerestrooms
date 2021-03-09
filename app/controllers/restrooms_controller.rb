require_relative '../helpers/recaptcha_helper'

# rubocop:disable Metrics/ClassLength
class RestroomsController < ApplicationController
  respond_to :html, :json

  before_action :restrooms_filters, only: [:index]
  before_action :list_restrooms, only: [:index]
  before_action :find_restroom, only: %i[show update edit]

  def index
    @view = params[:view] || 'list'
    if params[:nearby]
      render :nearby, layout: false
    else
      respond_with @restrooms
    end
  end

  # rubocop:disable Metrics/MethodLength
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
  # rubocop:enable Metrics/MethodLength

  def show; end

  # rubocop:disable Metrics/AbcSize
  # rubocop:disable Metrics/MethodLength
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
  # rubocop:enable Metrics/AbcSize
  # rubocop:enable Metrics/MethodLength

  def edit; end

  # rubocop:disable Metrics/AbcSize
  # rubocop:disable Metrics/MethodLength
  def update
    if params[:restroom][:downvote]
      Restroom.increment_counter(:downvote, @restroom.id) # rubocop:disable Rails/SkipsModelValidations
    elsif params[:restroom][:upvote]
      Restroom.increment_counter(:upvote, @restroom.id) # rubocop:disable Rails/SkipsModelValidations
    elsif @restroom.update(permitted_params)
      flash[:notice] = I18n.t('restroom.flash.updated')
    else
      display_errors
      render 'edit'
    end

    redirect_to @restroom
  end
  # rubocop:enable Metrics/AbcSize
  # rubocop:enable Metrics/MethodLength

  private

  def restrooms_filters
    @filters =
      params
      .fetch(:filters, '')
      .split(',')
      .each_with_object({}) do |filter, filters|
        filters[filter] = true if %w[accessible changing_table unisex].include?(filter)
      end
  end

  # rubocop:disable Metrics/AbcSize
  def list_restrooms
    @restrooms = Restroom.current.where(@filters).page(params[:page])
    @restrooms =
      if params[:search].present? || params[:map] == "1"
        @restrooms.near([params[:lat], params[:long]], 20, order: 'distance')
      else
        @restrooms.reverse_order
      end

    @restrooms = @restrooms.out_of_range? ? @restrooms.page(1) : @restrooms
  end
  # rubocop:enable Metrics/AbcSize

  def display_errors
    if @restroom.errors.any?
      @restroom.errors.each do
        flash[:alert] = I18n.t('restroom.flash.field')
      end
    else
      flash[:alert] = I18n.t('restroom.flash.unexpected')
    end
  end

  def find_restroom
    @restroom = Restroom.find(params[:id])
  end

  # rubocop:disable Metrics/MethodLength
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
  # rubocop:enable Metrics/MethodLength
end
# rubocop:enable Metrics/ClassLength
