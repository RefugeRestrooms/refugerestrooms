Rails.application.routes.draw do
  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)
  resources :restrooms, except: [:edit, :destroy]
  mount API::Base => '/api'

  get '/contact', to: 'contacts#new'
  get "/*id" => 'pages#show', as: :page, format: false
  root to: 'pages#index'

  resources "contacts", only: [:new, :create]
end
