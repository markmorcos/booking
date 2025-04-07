Rails.application.routes.draw do
  devise_for :users

  # Public root route
  root to: "home#index"

  get "up" => "rails/health#show", as: :rails_health_check

  # Admin web interface
  namespace :admin do
    root to: "dashboard#index"

    resources :availability_slots do
      collection do
        get :new_batch
        post :create_batch
        patch :update_durations
        delete :delete_range
      end
    end

    resources :appointments do
      member do
        patch :confirm
        patch :cancel
        patch :reschedule
        patch :complete
        patch :mark_no_show
      end
    end
  end

  namespace :api do
    resources :availability_slots, only: [ :index ]
    resources :appointments, only: [ :index, :create ]

    namespace :admin do
      resources :availability_slots do
        collection do
          get :new_batch
          post :create_batch
          patch :update_durations
          delete :delete_range
        end
      end

      resources :appointments, only: [ :index, :show, :update, :destroy ] do
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
end
