class Admin::DashboardController < Admin::BaseController
  def index
    @upcoming_appointments = current_tenant.appointments
                                         .where(status: [ :pending, :confirmed ])
                                         .joins(:availability_slot)
                                         .where("availability_slots.starts_at > ?", Time.current)
                                         .order("availability_slots.starts_at ASC")
                                         .limit(5)

    @availability_slots_count = current_tenant.availability_slots.future.count
    @available_slots_count = current_tenant.availability_slots.future.available.count
    @pending_appointments_count = current_tenant.appointments.where(status: :pending).count
    @today_appointments = current_tenant.appointments
                                      .joins(:availability_slot)
                                      .where("DATE(availability_slots.starts_at) = ?", Date.current)
                                      .order("availability_slots.starts_at ASC")
  end
end
