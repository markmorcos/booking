class ApplicationController < ActionController::Base
  include TenantContext
  before_action :set_current_tenant
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  private

  def default_url_options
    { tenant_path: current_tenant&.path }
  end
end
