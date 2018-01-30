class AddCountryforInternationalListings < ActiveRecord::Migration[4.2]
  def change
    add_column :bathrooms, :country, :string
  end
end
