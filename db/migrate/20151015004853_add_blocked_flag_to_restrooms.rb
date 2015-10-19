class AddBlockedFlagToRestrooms < ActiveRecord::Migration
  def change
    add_column :restrooms, :blocked, :boolean, default: false
  end
end
