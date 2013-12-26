class ChangeTable < ActiveRecord::Migration
  def change
    rename_column :bathrooms, :type, :bath_type
  end
end
