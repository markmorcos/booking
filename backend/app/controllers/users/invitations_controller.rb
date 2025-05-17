class Users::InvitationsController < Devise::InvitationsController
  include TenantContext

  before_action :set_current_tenant
  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:accept_invitation, keys: [ :name, :phone ])
  end

  def after_invite_path_for(resource)
    admin_user_path(resource)
  end

  def after_accept_path_for(resource)
    admin_root_path
  end
end
