ActiveAdmin.register Restroom do
  permit_params :name, :street, :city, :state, :accessible, :changing_table, :unisex, :directions,
                :comment, :latitude, :longitude, :country, :edit_id, :approved
end
