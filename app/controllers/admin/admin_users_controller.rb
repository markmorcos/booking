# app/controllers/admin/admin_users_controller.rb
module Admin
  class AdminUsersController < BaseController
    before_action :set_admin_user, only: [:edit, :update, :destroy]
    before_action :require_admin

    def index
      @admin_users = AdminUser.all.order(:name)
    end

    def new
      @admin_user = AdminUser.new
    end

    def edit
    end

    def create
      @admin_user = AdminUser.new(admin_user_params)

      if @admin_user.save
        redirect_to admin_admin_users_path, notice: 'Admin user was successfully created.'
      else
        render :new, status: :unprocessable_entity
      end
    end

    def update
      # Don't update password if it's blank
      if params[:admin_user][:password].blank?
        params[:admin_user].delete(:password)
        params[:admin_user].delete(:password_confirmation)
      end

      if @admin_user.update(admin_user_params)
        redirect_to admin_admin_users_path, notice: 'Admin user was successfully updated.'
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @admin_user.destroy
      redirect_to admin_admin_users_path, notice: 'Admin user was successfully deleted.', status: :see_other
    end

    private

    def set_admin_user
      @admin_user = AdminUser.find(params[:id])
    end

    def admin_user_params
      params.require(:admin_user).permit(:name, :email, :password, :password_confirmation)
    end
  end
end 