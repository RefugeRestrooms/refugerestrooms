class AddChangingTableFlagToRestrooms < ActiveRecord::Migration[4.2]
  def change
    add_column :restrooms, :changing_table, :boolean, default: false
  end
end
