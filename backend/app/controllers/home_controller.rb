class HomeController < ApplicationController
  def index
    if current_user&.admin?
      redirect_to admin_root_path
    end
  end

  def privacy
  end
end
