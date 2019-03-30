class CreateBulkUploads < ActiveRecord::Migration[5.2]
  def change
    create_table :bulk_uploads do |t|

      t.timestamps
    end
  end
end
