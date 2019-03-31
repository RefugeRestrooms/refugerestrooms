class BulkUploadsController < ApplicationController
  before_action :authenticate_approved_user!, only: [:create]

  def new
    @bulk_upload = BulkUpload.new
    @user = current_user
  end

  def create
    @bulk_upload = BulkUpload.new(bulk_upload_params)
    @bulk_upload.user = current_user
    if @bulk_upload.save
      BulkImportJob.perform_later @bulk_upload
      redirect_to bulk_upload_path(@bulk_upload)
    else
      Rails.logger.error "Errors saving bulk_upload:"
      @bulk_upload.errors.each { |field, message| Rails.logger.error "Field: #{field}, Message: #{message}" }
      render action: :new
    end
  end

  def show
  end

  private
    def authenticate_approved_user!
      unless user_signed_in?
        redirect_to new_user_session_path
        return false
      end
    end

    def bulk_upload_params
      params.require(:bulk_upload).permit(:file)
    end
end
