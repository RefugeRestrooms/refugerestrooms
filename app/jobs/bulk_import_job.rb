require 'csv'
require 'geocoder'

class BulkImportJob < ApplicationJob
  queue_as :default

  def perform(bulk_upload)
    contents = bulk_upload.file.download
    Rails.logger.info Geocoder.config

    CSV.parse(contents, headers: true) do |row|
      values = row.to_hash.slice "name", "street", "city", "state", "country"
      rr = Restroom.new values
      if rr.valid?
        if rr.latitude && rr.longitude
          rr.save
        else
          # TODO: add row_error
          Rails.logger.warn "Unable to geocode data: #{values}"
        end
      else
        # TODO: also add row_error
        Rails.logger.warn "Unable to validate data: #{values}"
      end
    end
  end
end
