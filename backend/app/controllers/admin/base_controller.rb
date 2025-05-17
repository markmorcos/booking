class Admin::BaseController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin!
  layout "admin"

  private

  def authorize_admin!
    unless current_user&.admin? && current_user.tenant == current_tenant
      redirect_to home_path, alert: "You are not authorized to access this area"
    end
  end
end
