class RenameBooleanColumnsInRestroom < ActiveRecord::Migration[5.0]
  def change
    rename_column :restrooms, :is_1, :is_singleGendered
    rename_column :restrooms, :is_2, :is_singleNeutral
    rename_column :restrooms, :is_3, :is_multipleFriendly
  end
end
