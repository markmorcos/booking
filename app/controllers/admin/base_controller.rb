class Admin::BaseController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin!
  layout 'admin'

  private

  def authorize_admin!
    redirect_to home_path, alert: "You are not authorized to access this area" unless current_user&.admin?
  end
end