class AddApprovedToRestroom < ActiveRecord::Migration
  def change
    add_column :restrooms, :approved, :boolean, default: false
  end
end
