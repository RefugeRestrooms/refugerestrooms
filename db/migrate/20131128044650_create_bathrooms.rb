class CreateBathrooms < ActiveRecord::Migration[4.2]
  def change
    create_table :bathrooms do |t|
      t.string :name
      t.string :street
      t.string :city
      t.string :state
      t.integer :access
      t.integer :type
      t.text :directions
      t.text :comment
      t.float :latitude
      t.float :longitude

      t.timestamps
    end
  end
end
