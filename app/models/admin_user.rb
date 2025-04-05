# app/models/admin_user.rb
class AdminUser < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable, :registerable, :recoverable and :omniauthable
  devise :database_authenticatable, :rememberable, :validatable
  
  validates :name, presence: true
  validates :email, presence: true, uniqueness: true

  # Return true if user is admin
  def admin?
    true
  end
end 