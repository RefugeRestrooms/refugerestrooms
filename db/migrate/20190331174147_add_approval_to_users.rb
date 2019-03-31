class AddApprovalToUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :approved, :boolean, :default => false
  end
end
