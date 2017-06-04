class Removeis4FromRestroom < ActiveRecord::Migration[5.0]
  def change
	remove_column :restrooms, :is_4, :boolean
  end
end
