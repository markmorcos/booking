module TenantContext
  extend ActiveSupport::Concern

  included do
    helper_method :current_tenant
  end

  private

  def current_tenant
    @current_tenant ||= current_user&.tenant
  end

  def set_current_tenant
    @current_tenant = current_user&.tenant
  end
end
