require 'rails_helper'

RSpec.describe Appointment, type: :model do
  describe 'associations' do
    it { should belong_to(:availability_slot) }
  end

  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:email) }
    it { should validate_presence_of(:phone) }
    it { should validate_presence_of(:availability_slot_id) }
    it { should validate_uniqueness_of(:availability_slot_id) }
  end

  describe 'enums' do
    it { should define_enum_for(:status).with_values(pending: 0, confirmed: 1, cancelled: 2) }
  end

  describe 'scopes' do
    let!(:upcoming_appointment) do
      create(:appointment, availability_slot: create(:availability_slot, start_time: Time.current + 1.day))
    end
    
    let!(:past_appointment) do
      create(:appointment, availability_slot: create(:availability_slot, 
        start_time: Time.current - 2.hours, 
        end_time: Time.current - 1.hour
      ))
    end
    
    let!(:pending_appointment) { create(:appointment, status: :pending) }
    let!(:confirmed_appointment) { create(:appointment, status: :confirmed) }
    let!(:cancelled_appointment) { create(:appointment, status: :cancelled) }
    
    describe '.upcoming' do
      it 'returns appointments with future availability slots' do
        expect(Appointment.upcoming).to include(upcoming_appointment)
        expect(Appointment.upcoming).not_to include(past_appointment)
      end
    end
    
    describe '.past' do
      it 'returns appointments with past availability slots' do
        expect(Appointment.past).to include(past_appointment)
        expect(Appointment.past).not_to include(upcoming_appointment)
      end
    end
    
    describe '.pending/.confirmed/.cancelled' do
      it 'returns appointments with the corresponding status' do
        expect(Appointment.pending).to include(pending_appointment)
        expect(Appointment.confirmed).to include(confirmed_appointment)
        expect(Appointment.cancelled).to include(cancelled_appointment)
        
        expect(Appointment.pending).not_to include(confirmed_appointment, cancelled_appointment)
        expect(Appointment.confirmed).not_to include(pending_appointment, cancelled_appointment)
        expect(Appointment.cancelled).not_to include(pending_appointment, confirmed_appointment)
      end
    end
  end

  describe 'instance methods' do
    let(:availability_slot) { create(:availability_slot) }
    let(:appointment) { create(:appointment, availability_slot: availability_slot) }
    
    describe '#start_time' do
      it 'returns the start time of the associated availability slot' do
        expect(appointment.start_time).to eq(availability_slot.start_time)
      end
    end
    
    describe '#end_time' do
      it 'returns the end time of the associated availability slot' do
        expect(appointment.end_time).to eq(availability_slot.end_time)
      end
    end
    
    describe '#duration_in_minutes' do
      it 'returns the duration of the associated availability slot in minutes' do
        expect(appointment.duration_in_minutes).to eq(availability_slot.duration_in_minutes)
      end
    end
    
    describe '#confirm!' do
      it 'updates the status to confirmed' do
        appointment.confirm!
        expect(appointment.status).to eq('confirmed')
      end
    end
    
    describe '#cancel!' do
      it 'updates the status to cancelled' do
        appointment.cancel!
        expect(appointment.status).to eq('cancelled')
      end
    end
  end
end 