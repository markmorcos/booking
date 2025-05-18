class User < ApplicationRecord
  devise :invitable, :database_authenticatable, :rememberable, :recoverable, :invitable

  attribute :role, :string, default: "user"
  attribute :name, :string
  attribute :phone, :string

  belongs_to :tenant
  has_many :appointments, dependent: :destroy

  validates :name, presence: true
  validates :email, presence: true, uniqueness: { scope: :tenant_id, case_sensitive: false }
  validates :phone, presence: true
  validates :phone, format: { with: /\A[0-9\+\-\(\) ]+\z/, message: "is invalid" }, if: -> { phone.present? }

  scope :admins, -> { where(role: "admin") }
  scope :users, -> { where(role: "user") }
  scope :tenant_path, ->(path) { joins(:tenant).where(tenants: { path: path }) }
  scope :for_tenant, ->(tenant) { where(tenant_id: tenant.id) }

  def admin?
    role == "admin"
  end
end
