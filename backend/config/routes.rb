Rails.application.routes.draw do
  # Tenant path constraint
  tenant_constraint = lambda do |request|
    Tenant.exists?(path: request.params[:tenant_path])
  end

  # Non-invitation Devise routes
  devise_for :users,
            path: "admin",
            path_names: { sign_in: "login", sign_out: "logout" },
            skip: [ :invitations ],
            only: [ :sessions, :passwords, :confirmations ]

  root to: "home#index"

  get "privacy", to: "home#privacy", as: :privacy_policy

  get "up" => "rails/health#show", as: :rails_health_check

  # Invitation routes only, with explicit path
  devise_for :users,
          path: "admin",
          controllers: { invitations: "users/invitations" },
          only: [ :invitations ],
          skip: [ :sessions, :passwords, :confirmations ]

  # Public routes for each tenant
  resources :appointments, only: [ :new, :create, :show ]
  resources :availability_slots, only: [ :index ]

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

    resources :users do
      member do
        post :resend_invitation
      end
    end
  end

  # API routes
  namespace :api do
    resources :availability_slots, only: [ :index ]
    resources :appointments, only: [ :index, :create ] do
      member do
        patch :cancel
        patch :reschedule
      end
    end
  end

  # Public booking routes
  scope "/b/:tenant_path", constraints: tenant_constraint do
    get "/", to: "public_bookings#show", as: :public_booking
    get "/details/:slot_id", to: "public_bookings#details", as: :public_booking_details
    post "/details/:slot_id", to: "public_bookings#create", as: :create_public_booking
    get "/confirmation/:id", to: "public_bookings#confirmation", as: :public_booking_confirmation
    get "/confirmation/:id/calendar", to: "public_bookings#calendar", as: :public_booking_calendar
  end
end
