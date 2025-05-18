class ApplicationController < ActionController::Base
  include TenantContext

  before_action :set_current_tenant
  allow_browser versions: :modern
end
