module Api
  class BaseController < ApplicationController
    protect_from_forgery with: :null_session
    rescue_from ActiveRecord::RecordNotFound, with: :not_found
    rescue_from ActiveRecord::RecordInvalid, with: :record_invalid

    private

    def not_found
      render json: { error: "Resource not found" }, status: :not_found
    end

    def record_invalid(exception)
      render json: { error: exception.message }, status: :unprocessable_entity
    end
  end
end
