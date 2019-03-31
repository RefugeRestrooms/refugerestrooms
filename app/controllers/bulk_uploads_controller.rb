class BulkUploadsController < ApplicationController
  before_action :authenticate_approved_user!, only: [:create]

  def new
    @bulk_upload = BulkUpload.new
    @user = current_user
  end

  def create
    @bulk_upload = BulkUpload.new(bulk_upload_params)
    if @bulk_upload.save
      redirect_to bulk_upload_path(@bulk_upload)
    else
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