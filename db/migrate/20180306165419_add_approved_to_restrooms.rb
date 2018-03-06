class AddApprovedToRestrooms < ActiveRecord::Migration[5.1]
  def change
    add_column :restrooms, :approved, :boolean, :default => true
  end
end
