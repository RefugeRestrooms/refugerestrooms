class AddVisability < ActiveRecord::Migration[4.2]
  def change
    add_column :bathrooms, :visable, :boolean, :default => true
  end
end
