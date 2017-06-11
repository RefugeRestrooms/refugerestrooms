Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  devise_for :admin_users, ActiveAdmin::Devise.config
    ActiveAdmin.routes(self)
    resources :restrooms, except: [:edit, :destroy]
    mount API::Base => '/api'

    get '/contact', to: 'contacts#new'
    get "/*id" => 'pages#show', as: :page, format: false
    root 'pages#index'

    resources "contacts", only: [:new, :create]
end
