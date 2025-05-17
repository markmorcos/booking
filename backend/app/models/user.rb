class User < ApplicationRecord
  devise :database_authenticatable, :rememberable, :confirmable, :recoverable

  attribute :role, :string, default: "user"
  attribute :name, :string
  attribute :phone, :string

  has_many :appointments, dependent: :destroy

  validates :name, presence: true

  scope :admins, -> { where(role: "admin") }
  scope :users, -> { where(role: "user") }

  def admin?
    role == "admin"
  end
end
