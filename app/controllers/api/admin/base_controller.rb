module Api
  module Admin
    class BaseController < Api::BaseController
      before_action :authorize_admin!

      private

      def authorize_admin!
        render json: { error: 'You are not authorized to access this area' }, status: :unauthorized unless current_user&.admin?
      end
    end
  end
end
