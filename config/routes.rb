Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # API Endpoints
  namespace :api do
    # Public endpoints
    resources :availability_slots, only: [ :index ]
    resources :appointments, only: [ :create ]

    # Admin endpoints
    namespace :admin do
      resources :availability_slots do
        collection do
          post :create_batch
          patch :update_durations
          delete :delete_range
        end
      end

      resources :appointments, only: [ :index, :show ] do
        member do
          patch :approve
          patch :cancel
          patch :reschedule
          patch :complete
          patch :mark_no_show
        end
      end
    end
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
