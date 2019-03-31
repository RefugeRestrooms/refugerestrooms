Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  resources :bulk_uploads, only: [:new, :create, :show]

  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  }

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
