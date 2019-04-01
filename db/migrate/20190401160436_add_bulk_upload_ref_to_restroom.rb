class AddBulkUploadRefToRestroom < ActiveRecord::Migration[5.2]
  def change
    add_reference :restrooms, :bulk_upload, foreign_key: true
  end
end
