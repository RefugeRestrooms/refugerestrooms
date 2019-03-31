class AddUserIdToBulkUpload < ActiveRecord::Migration[5.2]
  def change
    add_reference :bulk_uploads, :user
  end
end
