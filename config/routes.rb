Rails.application.routes.draw do
  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)
  resources :restrooms
  mount API::Base => '/api'

  get '/about', to: 'welcome#about'
  get '/signs', to: 'welcome#signs'
  get '/text', to: 'welcome#text_msg'
  get '/contact', to: 'contacts#new'
  get '/license', to: 'welcome#license'

  root to: "welcome#index"

  resources "contacts", only: [:new, :create]
end
