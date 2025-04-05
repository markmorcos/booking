# app/controllers/api/v1/base_controller.rb
module Api
  module V1
    class BaseController < ActionController::API
      include ActionController::HttpAuthentication::Token::ControllerMethods
      
      before_action :set_default_format
      rescue_from ActiveRecord::RecordNotFound, with: :not_found
      rescue_from ActionController::ParameterMissing, with: :parameter_missing
      rescue_from ActiveRecord::RecordInvalid, with: :validation_failed
      
      protected
      
      def authenticate_admin_user!
        authenticate_with_token || render_unauthorized
      end
      
      def current_admin_user
        @current_admin_user
      end
      
      private
      
      def set_default_format
        request.format = :json
      end
      
      def authenticate_with_token
        authenticate_with_http_token do |token, options|
          # In a real app, you would validate the JWT token and extract the user_id
          # For this example, we'll use a placeholder implementation
          
          # This would be replaced with proper JWT validation
          if token && token.length > 10
            # In a real app, you would extract the user_id from the token and find the user
            @current_admin_user = AdminUser.first
            return true
          end
        end
        false
      end
      
      def render_unauthorized
        render json: { errors: ["Not Authorized"] }, status: :unauthorized
      end
      
      def not_found
        render json: { errors: ["Resource not found"] }, status: :not_found
      end
      
      def parameter_missing(exception)
        render json: { errors: [exception.message] }, status: :unprocessable_entity
      end
      
      def validation_failed(exception)
        render json: { errors: exception.record.errors }, status: :unprocessable_entity
      end
    end
  end
end 