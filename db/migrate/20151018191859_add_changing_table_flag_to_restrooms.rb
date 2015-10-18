class AddChangingTableFlagToRestrooms < ActiveRecord::Migration
  def change
    add_column :restrooms, :changing_table, :boolean, default: false
  end
end
