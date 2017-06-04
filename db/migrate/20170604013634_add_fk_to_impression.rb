class AddFkToImpression < ActiveRecord::Migration[5.0]
  def change
    add_reference :impressions, :restroom, foreign_key: true
  end
end
