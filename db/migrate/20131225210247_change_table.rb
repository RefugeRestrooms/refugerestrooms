class ChangeTable < ActiveRecord::Migration[4.2]
  def change
    rename_column :bathrooms, :type, :bath_type
  end
end
