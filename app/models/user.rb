class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  # Sets admin as false by default
  attribute :admin, :boolean, default: false

  # Scope to find admin users
  scope :admins, -> { where(admin: true) }

  # Check if user is an admin
  def admin?
    admin
  end
end
