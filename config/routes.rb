Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Public routes (no subdomain)
  constraints(subdomain: '') do
    root "home#index"
    resources :appointments, only: [:new, :create] do
      collection do
        get :success
      end
    end
    resources :availability_slots, only: [:index]
  end

  # Admin subdomain routes
  constraints(subdomain: 'admin') do
    devise_for :admin_users, path: '', skip: [:registrations]
    
    authenticated :admin_user do
      root 'admin/dashboard#index', as: :admin_root
    end
    
    root 'devise/sessions#new'
    
    namespace :admin do
      get 'dashboard', to: 'dashboard#index'
      resources :availability_slots
      resources :appointments do
        member do
          patch :confirm
          patch :cancel
        end
      end
      resources :admin_users, except: [:show]
    end
  end

  # API routes
  namespace :api do
    namespace :v1 do
      post 'auth/sign_in', to: 'authentication#create'
      resources :availability_slots, only: [:index, :create, :destroy]
      resources :appointments, only: [:index, :show, :create, :update]
    end
  end

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
