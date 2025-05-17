class AppointmentsController < ApplicationController
  before_action :set_appointment, only: [ :show ]

  def new
    @appointment = Appointment.new
    @available_slots = current_tenant.availability_slots
                                   .future
                                   .available
                                   .order(starts_at: :asc)
  end

  def create
    @appointment = Appointment.new(appointment_params)
    @appointment.tenant = current_tenant

    if @appointment.save
      redirect_to appointment_path(@appointment), notice: "Appointment was successfully created."
    else
      @available_slots = current_tenant.availability_slots
                                     .future
                                     .available
                                     .order(starts_at: :asc)
      render :new, status: :unprocessable_entity
    end
  end

  def show
  end

  private

  def set_appointment
    @appointment = current_tenant.appointments.find(params[:id])
  end

  def appointment_params
    params.require(:appointment).permit(:user_id, :availability_slot_id)
  end
end
