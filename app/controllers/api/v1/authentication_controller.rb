module Api
  module V1
    class AuthenticationController < BaseController
      def create
        user = AdminUser.find_by(email: auth_params[:email])
        
        if user && user.valid_password?(auth_params[:password])
          # In a real app, you would generate a JWT token here
          # For this example, we'll use a placeholder implementation
          token = generate_token(user)
          
          render json: {
            token: token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name
            }
          }
        else
          render json: { errors: ["Invalid email or password"] }, status: :unauthorized
        end
      end
      
      private
      
      def auth_params
        params.require(:user).permit(:email, :password)
      end
      
      def generate_token(user)
        # In a real app, this would generate a proper JWT token
        # For this example, we'll use a placeholder implementation
        "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2MTcyOTM5MzZ9.example_token_#{user.id}"
      end
    end
  end
end 