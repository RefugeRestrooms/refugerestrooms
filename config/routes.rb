Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  devise_for :admin_users, ActiveAdmin::Devise.config
    get '/:locale' => 'pages#index'
    root 'pages#index'

    ActiveAdmin.routes(self)
    scope "(:locale)" do
      resources :restrooms, except: [:edit, :destroy]
    end

    namespace :api do
      scope "(:locale)" do
        resources :docs, only: [:index]
      end
    end

    mount API::Base => '/api'
    scope "(:locale)" do
      get '/contact', to: 'contacts#new'
      get "/*id" => 'pages#show', as: :page, format: false
    end

    scope "(:locale)" do
      resources "contacts", only: [:new, :create]
    end
end
