class AddEditIdToRestrooms < ActiveRecord::Migration[5.1]
  def change
    add_column :restrooms, :edit_id, :integer, :default => 0
  end
end
