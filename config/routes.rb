# this seems to be needed to correct the loading order of the controllers
# there may be a better way to do this
require_relative '../app/controllers/api/v1/base'
require_relative '../app/controllers/api/base'

Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  devise_for :admin_users, ActiveAdmin::Devise.config
    ActiveAdmin.routes(self)
    resources :restrooms, except: [:edit, :destroy]

    namespace :api do
      resources :docs, only: [:index]
    end

    mount API::Base => '/api'

    get '/contact', to: 'contacts#new'
    get "/*id" => 'pages#show', as: :page, format: false
    root 'pages#index'

    resources "contacts", only: [:new, :create]
end
