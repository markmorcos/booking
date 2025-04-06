Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    resources :availability_slots, only: [ :index ]
    resources :appointments, only: [ :index, :create ]

    namespace :admin do
      resources :availability_slots do
        collection do
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
