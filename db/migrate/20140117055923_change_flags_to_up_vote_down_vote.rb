class ChangeFlagsToUpVoteDownVote < ActiveRecord::Migration[4.2]
  def change
    remove_column :bathrooms, :flags
    remove_column :bathrooms, :visable
    add_column :bathrooms, :downvote, :integer, :default => 0
    add_column :bathrooms, :upvote, :integer, :default => 0
  end
end
