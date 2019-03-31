class BulkUpload < ApplicationRecord
  has_one_attached :file
  belongs_to :user, required: true
end
