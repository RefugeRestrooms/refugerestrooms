class AddBoolsToRestroom < ActiveRecord::Migration[5.0]
  def change
    add_column :restrooms, :is_1, :boolean
    add_column :restrooms, :is_2, :boolean
    add_column :restrooms, :is_3, :boolean
    add_column :restrooms, :is_4, :boolean
  end
end
