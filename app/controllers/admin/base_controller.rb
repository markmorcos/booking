module Admin
  class BaseController < ApplicationController
    before_action :authenticate_admin_user!
    layout 'admin'
    
    protected
    
    def require_admin
      unless current_admin_user&.admin?
        flash[:alert] = "You are not authorized to access this page."
        redirect_to root_path
      end
    end
  end
end 