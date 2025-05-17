class Tenant < ApplicationRecord
  has_many :users
  has_many :appointments
  has_many :availability_slots

  validates :path, presence: true, uniqueness: true,
            format: { with: /\A[a-z0-9-]+\z/, message: "can only contain lowercase letters, numbers, and hyphens" }

  before_validation :normalize_path

  private

  def normalize_path
    self.path = path.to_s.downcase.gsub(/[^a-z0-9-]/, "-").gsub(/-+/, "-").gsub(/^-|-$/, "") if path.present?
  end
end
