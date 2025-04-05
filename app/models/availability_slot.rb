# app/models/availability_slot.rb
class AvailabilitySlot < ApplicationRecord
  has_one :appointment, dependent: :restrict_with_error
  
  validates :start_time, presence: true
  validates :end_time, presence: true
  validate :end_time_after_start_time
  validate :no_overlapping_slots
  
  scope :available, -> { where(id: all.left_joins(:appointment).where(appointments: { id: nil }).select(:id)) }
  scope :booked, -> { joins(:appointment) }
  scope :upcoming, -> { where('start_time > ?', Time.current) }
  scope :past, -> { where('end_time < ?', Time.current) }
  scope :date_range, ->(start_date, end_date) {
    where('start_time >= ? AND end_time <= ?', 
          start_date.beginning_of_day, 
          end_date.present? ? end_date.end_of_day : start_date.end_of_day)
  }
  
  def booked?
    appointment.present?
  end
  
  def duration_in_minutes
    ((end_time - start_time) / 60).to_i
  end
  
  private
  
  def end_time_after_start_time
    return if end_time.blank? || start_time.blank?
    
    if end_time <= start_time
      errors.add(:end_time, "must be after start time")
    end
  end
  
  def no_overlapping_slots
    return if end_time.blank? || start_time.blank?
    
    overlapping_slots = AvailabilitySlot.where.not(id: id)
                                       .where('(start_time <= ? AND end_time >= ?) OR 
                                               (start_time <= ? AND end_time >= ?) OR 
                                               (start_time >= ? AND end_time <= ?)',
                                              start_time, start_time, 
                                              end_time, end_time, 
                                              start_time, end_time)
    
    if overlapping_slots.exists?
      errors.add(:base, "Overlaps with another availability slot")
    end
  end
end 