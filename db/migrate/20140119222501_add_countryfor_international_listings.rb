class AddCountryforInternationalListings < ActiveRecord::Migration
  def change
    add_column :bathrooms, :country, :string
  end
end
