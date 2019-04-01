require 'csv'
require 'geocoder'

class BulkImportJob < ApplicationJob
  class GenericError < StandardError
    def initialize(message:, upload:, row_level_errors:)
      @upload = upload
      @row_level_errors = row_level_errors
      super(message)
    end
  end

  queue_as :default
  discard_on(GenericError)

  def perform(bulk_upload)
    contents = bulk_upload.file.download
    Rails.logger.info Geocoder.config
    row_level_errors = []

    CSV.parse(contents, headers: true) do |row|
      values = row.to_hash.slice 'name', 'street', 'city', 'state', 'country', 'directions', 'comment'
      rr = Restroom.new values
      rr.bulk_upload = bulk_upload
      if rr.valid?
        if rr.latitude && rr.longitude
          SaveRestroom.new(rr, false).call
        else
          row_level_errors << NonGeocodableRow.new(values)
          Rails.logger.warn "Unable to geocode data: #{values}"
        end
      else
        row_level_errors << InvalidRow.new(values)
        Rails.logger.warn "Unable to validate data: #{values}"
      end
    end

    # This is a stupidest-thing-that-could-work solution
    # due to limited time at a hackathon.
    # Please replace me with real validation error handling in the future.
    if row_level_errors.length > 0
      raise "problems with at least one CSV row"
    end

  rescue Exception => e
    raise GenericError.new(message: e.message, upload: bulk_upload, row_level_errors: row_level_errors)
  end

  NonGeocodableRow = Struct.new(:row)
  InvalidRow = Struct.new(:row)
end
