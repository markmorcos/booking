# app/controllers/availability_slots_controller.rb
class AvailabilitySlotsController < ApplicationController
  def index
    start_date = params[:start_date].present? ? Date.parse(params[:start_date]) : Date.today
    end_date = params[:end_date].present? ? Date.parse(params[:end_date]) : start_date + 30.days
    
    @availability_slots = AvailabilitySlot.available
                                           .upcoming
                                           .date_range(start_date, end_date)
                                           .order(start_time: :asc)
    
    respond_to do |format|
      format.html
      format.json { render json: @availability_slots.map { |slot| slot_to_json(slot) } }
    end
  end
  
  private
  
  def slot_to_json(slot)
    {
      id: slot.id,
      start_time: slot.start_time,
      end_time: slot.end_time,
      booked: slot.booked?,
      duration_in_minutes: slot.duration_in_minutes
    }
  end
end 