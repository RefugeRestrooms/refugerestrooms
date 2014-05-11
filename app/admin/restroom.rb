ActiveAdmin.register Restroom do

permit_params :name, :street, :city, :state, :accessible, :unisex, :directions,
              :comment, :latitude, :longitude, :country
end
