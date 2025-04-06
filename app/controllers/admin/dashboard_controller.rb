class Admin::DashboardController < Admin::BaseController
  def index
    @upcoming_appointments = Appointment.where(status: [:pending, :confirmed])
                                       .joins(:availability_slot)
                                       .where('availability_slots.starts_at > ?', Time.current)
                                       .order('availability_slots.starts_at ASC')
                                       .limit(5)
    
    @availability_slots_count = AvailabilitySlot.future.count
    @available_slots_count = AvailabilitySlot.future.available.count
    @pending_appointments_count = Appointment.where(status: :pending).count
    @today_appointments = Appointment.joins(:availability_slot)
                                    .where('DATE(availability_slots.starts_at) = ?', Date.current)
                                    .order('availability_slots.starts_at ASC')
  end
end