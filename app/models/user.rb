class User < ApplicationRecord
  devise :database_authenticatable, :rememberable, :confirmable, :recoverable

  attribute :admin, :boolean, default: false
  scope :admins, -> { where(admin: true) }

  def admin?
    admin
  end
end
