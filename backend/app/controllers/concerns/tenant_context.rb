module TenantContext
  extend ActiveSupport::Concern

  included do
    helper_method :current_tenant
  end

  private

  def current_tenant
    @current_tenant ||= Tenant.find_by(path: params[:tenant_path])
  end

  def set_current_tenant
    @current_tenant = if current_user&.admin?
      current_user.tenant
    else
      Tenant.find_by(path: params[:tenant_path])
    end
  end
end
