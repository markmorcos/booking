# app/controllers/appointments_controller.rb
class AppointmentsController < ApplicationController
  def new
    @appointment = Appointment.new
    @availability_slots = AvailabilitySlot.available.upcoming.order(start_time: :asc)
  end

  def create
    @appointment = Appointment.new(appointment_params)
    
    if @appointment.save
      redirect_to success_appointments_path
    else
      @availability_slots = AvailabilitySlot.available.upcoming.order(start_time: :asc)
      render :new, status: :unprocessable_entity
    end
  end

  def success
    # Display success message after booking
  end

  private

  def appointment_params
    params.require(:appointment).permit(:name, :email, :phone, :notes, :availability_slot_id)
  end
end 