class BulkUploadsController < ApplicationController
  def new
    @bulk_upload = BulkUpload.new
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
    def bulk_upload_params
      params.require(:bulk_upload).permit(:file)
    end
end