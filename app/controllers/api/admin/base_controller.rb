module Api
  module Admin
    class BaseController < Api::BaseController
      before_action :authenticate_admin!

      private

      def authenticate_admin!
        true
      end
    end
  end
end
