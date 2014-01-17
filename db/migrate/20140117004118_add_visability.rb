class AddVisability < ActiveRecord::Migration
  def change
    add_column :bathrooms, :visable, :boolean, :default => true
  end
end
