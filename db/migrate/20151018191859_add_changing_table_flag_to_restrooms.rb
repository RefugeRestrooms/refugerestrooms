class AddChangingTableFlagToRestrooms < ActiveRecord::Migration
  def change
    add_column :restrooms, :changing_table, :boolean
  end
end
