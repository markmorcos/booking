require_relative "../../services/whatsapp_service"

class Admin::AppointmentsController < Admin::BaseController
  include AppointmentStatusHandler

  before_action :set_appointment, only: [ :show, :edit, :update, :destroy, :confirm, :cancel, :reschedule, :complete, :mark_no_show ]

  def index
    @appointments = current_tenant.appointments.includes(:user, :availability_slot)
  end

  def show
  end

  def new
    @appointment = current_tenant.appointments.new
    @appointment.availability_slot_id = params[:availability_slot_id] if params[:availability_slot_id].present?
    @available_slots = current_tenant.availability_slots
                                   .future
                                   .order(starts_at: :asc)
  end

  def edit
    @available_slots = current_tenant.availability_slots
                                   .future
                                   .order(starts_at: :asc)
  end

  def create
    @appointment = current_tenant.appointments.new(appointment_params)

    if @appointment.save
      redirect_to admin_appointment_path(@appointment), notice: "Appointment was successfully created."
    else
      @available_slots = current_tenant.availability_slots
                                     .future
                                     .order(starts_at: :asc)
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @appointment.update(appointment_params)
      redirect_to admin_appointment_path(@appointment), notice: "Appointment was successfully updated."
    else
      @available_slots = current_tenant.availability_slots
                                     .future
                                     .order(starts_at: :asc)
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @appointment.destroy
    redirect_to admin_appointments_path, notice: "Appointment was successfully destroyed."
  end

  def confirm
    if handle_status_change(@appointment, :confirmed)
      redirect_to admin_appointment_path(@appointment), notice: "Appointment was confirmed."
    else
      redirect_to admin_appointment_path(@appointment), alert: "Failed to confirm appointment."
    end
  end

  def cancel
    if handle_status_change(@appointment, :cancelled)
      redirect_to admin_appointment_path(@appointment), notice: "Appointment was cancelled."
    else
      redirect_to admin_appointment_path(@appointment), alert: "Failed to cancel appointment."
    end
  end

  def reschedule
    if @appointment.update(appointment_params)
      redirect_to admin_appointment_path(@appointment), notice: "Appointment was rescheduled."
    else
      @available_slots = current_tenant.availability_slots
                                     .future
                                     .order(starts_at: :asc)
      render :edit, status: :unprocessable_entity
    end
  end

  def complete
    if handle_status_change(@appointment, :completed)
      redirect_to admin_appointment_path(@appointment), notice: "Appointment was marked as completed."
    else
      redirect_to admin_appointment_path(@appointment), alert: "Failed to mark appointment as completed."
    end
  end

  def mark_no_show
    if handle_status_change(@appointment, :no_show)
      redirect_to admin_appointment_path(@appointment), notice: "Appointment was marked as no show."
    else
      redirect_to admin_appointment_path(@appointment), alert: "Failed to mark appointment as no show."
    end
  end

  private

  def set_appointment
    @appointment = current_tenant.appointments.find(params[:id])
  end

  def appointment_params
    params.require(:appointment).permit(:user_id, :availability_slot_id, :status)
  end
end
