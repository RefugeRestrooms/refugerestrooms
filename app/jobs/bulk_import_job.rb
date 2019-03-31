class BulkImportJob < ApplicationJob
  queue_as :default

  def perform(bulk_job)
    Rails.logger.info bulk_job.class
    Rails.logger.info bulk_job
  end
end
