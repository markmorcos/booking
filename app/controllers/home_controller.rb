class HomeController < ApplicationController
  def index
    redirect_to admin_root_path if current_user&.admin?
  end

  def privacy
    # The privacy policy page doesn't require any special logic
  end
end
