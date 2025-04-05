module Admin
  class DashboardController < BaseController
    def index
      @upcoming_appointments = Appointment.upcoming.includes(:availability_slot).order('availability_slots.start_time ASC').limit(5)
      @pending_appointments = Appointment.pending.includes(:availability_slot).order('availability_slots.start_time ASC').limit(5)
      @today_appointments = Appointment.joins(:availability_slot)
                                       .where('availability_slots.start_time >= ? AND availability_slots.end_time <= ?', 
                                            Date.today.beginning_of_day, Date.today.end_of_day)
                                       .includes(:availability_slot)
                                       .order('availability_slots.start_time ASC')
      
      # Statistics
      @total_pending = Appointment.pending.count
      @total_confirmed = Appointment.confirmed.count
      @total_cancelled = Appointment.cancelled.count
      @total_slots = AvailabilitySlot.count
      @available_slots = AvailabilitySlot.available.upcoming.count
    end
  end
end 