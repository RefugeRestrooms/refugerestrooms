ActiveAdmin.register User do
  permit_params :email, :approved
end
