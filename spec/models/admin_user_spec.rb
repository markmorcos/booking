require 'rails_helper'

RSpec.describe AdminUser, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email).case_insensitive }
  end

  describe 'devise modules' do
    it { should have_db_column(:encrypted_password).of_type(:string) }
    it { should have_db_column(:remember_created_at).of_type(:datetime) }
  end

  describe '#admin?' do
    let(:admin_user) { create(:admin_user) }
    
    it 'always returns true' do
      expect(admin_user.admin?).to be_truthy
    end
  end
end 