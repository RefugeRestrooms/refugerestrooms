class RenameBathroomsToRestrooms < ActiveRecord::Migration[4.2]
  def change
    rename_table :bathrooms, :restrooms
  end
end
