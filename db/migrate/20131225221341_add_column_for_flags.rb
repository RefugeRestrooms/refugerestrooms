class AddColumnForFlags < ActiveRecord::Migration
  def change
    add_column :bathrooms, :flags, :integer, :default => 0
  end
end
