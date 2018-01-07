class AddApprovedVersionIdToRestrooms < ActiveRecord::Migration[5.1]
  def change
    add_column :restrooms, :approved_version_id, :integer, :default => 0
  end
end
