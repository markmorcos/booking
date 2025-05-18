class Admin::UsersController < Admin::BaseController
  before_action :set_user, only: [ :show, :edit, :update, :destroy, :resend_invitation ]

  def index
    @users = current_tenant.users.users.order(created_at: :desc)
                          .page(params[:page])
                          .per(10)
  end

  def show
  end

  def new
    @user = current_tenant.users.users.new
  end

  def edit
  end

  def create
    @user = current_tenant.users.users.new(user_params)

    if @user.save
      @user.invite!
      redirect_to admin_users_path, notice: "User was successfully created and invitation email sent."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @user.update(user_params)
      redirect_to admin_user_path(@user), notice: "User was successfully updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @user.destroy
    redirect_to admin_users_path, notice: "User was successfully deleted."
  end

  def resend_invitation
    @user.invite!
    redirect_to admin_users_path, notice: "Invitation was successfully resent."
  end

  private

  def set_user
    @user = current_tenant.users.users.find_by(id: params[:id])
    redirect_to admin_users_path unless @user.present?
  end

  def user_params
    if action_name == "create"
      params.require(:user).permit(:name, :email, :phone)
    else
      params.require(:user).permit(:name, :phone)
    end
  end
end
