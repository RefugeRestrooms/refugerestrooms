class RenameBathroomsToRestrooms < ActiveRecord::Migration
  def change
    rename_table :bathrooms, :restrooms
  end
end
