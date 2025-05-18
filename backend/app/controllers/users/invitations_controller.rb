class Users::InvitationsController < Devise::InvitationsController
  before_action :configure_permitted_parameters, if: :devise_controller?

  def create
    self.resource = invite_resource
    resource.save

    if resource.errors.empty?
      set_flash_message :notice, :send_instructions, email: resource.email if is_flashing_format?
      redirect_to after_invite_path_for(resource)
    else
      flash[:alert] = resource.errors.full_messages.to_sentence
      render :new, status: :unprocessable_entity
    end
  end

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:accept_invitation, keys: [ :name, :phone ])
  end

  def after_invite_path_for(resource)
    admin_users_path
  end

  def after_accept_path_for(resource)
    root_path
  end
end
