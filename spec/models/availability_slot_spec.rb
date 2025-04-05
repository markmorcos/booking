require 'rails_helper'

RSpec.describe AvailabilitySlot, type: :model do
  describe 'associations' do
    it { should have_one(:appointment).dependent(:restrict_with_error) }
  end

  describe 'validations' do
    it { should validate_presence_of(:start_time) }
    it { should validate_presence_of(:end_time) }
    
    describe 'custom validations' do
      let(:slot) { build(:availability_slot) }
      
      context 'when end_time is before start_time' do
        it 'is invalid' do
          slot.start_time = Time.current
          slot.end_time = Time.current - 1.hour
          
          expect(slot).not_to be_valid
          expect(slot.errors[:end_time]).to include('must be after start time')
        end
      end
      
      context 'when slot overlaps with existing slot' do
        let!(:existing_slot) { create(:availability_slot, 
          start_time: Time.current, 
          end_time: Time.current + 1.hour) 
        }
        
        it 'is invalid if start_time is within existing slot' do
          slot.start_time = existing_slot.start_time + 30.minutes
          slot.end_time = existing_slot.end_time + 30.minutes
          
          expect(slot).not_to be_valid
          expect(slot.errors[:base]).to include('Overlaps with another availability slot')
        end
        
        it 'is invalid if end_time is within existing slot' do
          slot.start_time = existing_slot.start_time - 30.minutes
          slot.end_time = existing_slot.start_time + 30.minutes
          
          expect(slot).not_to be_valid
          expect(slot.errors[:base]).to include('Overlaps with another availability slot')
        end
        
        it 'is invalid if surrounding existing slot' do
          slot.start_time = existing_slot.start_time - 30.minutes
          slot.end_time = existing_slot.end_time + 30.minutes
          
          expect(slot).not_to be_valid
          expect(slot.errors[:base]).to include('Overlaps with another availability slot')
        end
      end
    end
  end

  describe 'scopes' do
    let!(:available_slot) { create(:availability_slot) }
    let!(:booked_slot) { create(:availability_slot) }
    let!(:appointment) { create(:appointment, availability_slot: booked_slot) }
    let!(:upcoming_slot) { create(:availability_slot, start_time: Time.current + 1.day) }
    let!(:past_slot) { create(:availability_slot, start_time: Time.current - 2.hours, end_time: Time.current - 1.hour) }
    
    describe '.available' do
      it 'returns slots without appointments' do
        expect(AvailabilitySlot.available).to include(available_slot)
        expect(AvailabilitySlot.available).not_to include(booked_slot)
      end
    end
    
    describe '.booked' do
      it 'returns slots with appointments' do
        expect(AvailabilitySlot.booked).to include(booked_slot)
        expect(AvailabilitySlot.booked).not_to include(available_slot)
      end
    end
    
    describe '.upcoming' do
      it 'returns slots in the future' do
        expect(AvailabilitySlot.upcoming).to include(upcoming_slot)
        expect(AvailabilitySlot.upcoming).not_to include(past_slot)
      end
    end
    
    describe '.past' do
      it 'returns slots that have ended' do
        expect(AvailabilitySlot.past).to include(past_slot)
        expect(AvailabilitySlot.past).not_to include(upcoming_slot)
      end
    end
    
    describe '.date_range' do
      it 'returns slots within the given date range' do
        start_date = Date.today
        end_date = Date.today + 2.days
        
        expect(AvailabilitySlot.date_range(start_date, end_date)).to include(upcoming_slot)
        expect(AvailabilitySlot.date_range(start_date, end_date)).not_to include(past_slot)
      end
    end
  end

  describe '#booked?' do
    let(:available_slot) { create(:availability_slot) }
    let(:booked_slot) { create(:availability_slot) }
    let!(:appointment) { create(:appointment, availability_slot: booked_slot) }
    
    it 'returns true if slot has an appointment' do
      expect(booked_slot.booked?).to be_truthy
    end
    
    it 'returns false if slot does not have an appointment' do
      expect(available_slot.booked?).to be_falsey
    end
  end

  describe '#duration_in_minutes' do
    it 'returns the duration of the slot in minutes' do
      slot = create(:availability_slot, 
        start_time: Time.current, 
        end_time: Time.current + 45.minutes
      )
      
      expect(slot.duration_in_minutes).to eq(45)
    end
  end
end
