class Admin::AppointmentsController < Admin::BaseController
  before_action :set_appointment, except: [:index, :new, :create]
  
  def index
    @appointments = Appointment.joins(:availability_slot)
                              .order('availability_slots.starts_at DESC')
                              .page(params[:page]).per(10)

    @appointments = @appointments.where(status: params[:status]) if params[:status].present?
    @appointments = @appointments.where('booking_name ILIKE ?', "%#{params[:search]}%") if params[:search].present?
  end
  
  def show
  end
  
  def new
    @appointment = Appointment.new
    @available_slots = AvailabilitySlot.future.available.order(starts_at: :asc)
  end
  
  def create
    @appointment = Appointment.new(appointment_params)
    
    if @appointment.save
      AppointmentMailer.confirmation_email(@appointment).deliver_now
      redirect_to admin_appointment_path(@appointment), notice: "Appointment was successfully created."
    else
      @available_slots = AvailabilitySlot.future.available.order(starts_at: :asc)
      render :new, status: :unprocessable_entity
    end
  end
  
  def edit
    @available_slots = AvailabilitySlot.future.order(starts_at: :asc)
  end
  
  def update
    if @appointment.update(appointment_params)
      AppointmentMailer.confirmation_email(@appointment).deliver_now
      redirect_to admin_appointment_path(@appointment), notice: "Appointment was successfully updated."
    else
      @available_slots = AvailabilitySlot.future.order(starts_at: :asc)
      render :edit, status: :unprocessable_entity
    end
  end
  
  def destroy
    @appointment.destroy
    AppointmentMailer.cancellation_email(@appointment).deliver_now
    redirect_to admin_appointments_path, notice: "Appointment was successfully deleted."
  end

  def confirm
    @appointment.update(status: :confirmed)
    AppointmentMailer.confirmation_email(@appointment).deliver_now
    redirect_to admin_appointment_path(@appointment), notice: "Appointment was confirmed."
  end
  
  def cancel
    @appointment.update(status: :cancelled)
    AppointmentMailer.cancellation_email(@appointment).deliver_now
    redirect_to admin_appointment_path(@appointment), notice: "Appointment was cancelled."
  end
  
  def reschedule
    if params[:availability_slot_id].present?
      new_slot = AvailabilitySlot.find(params[:availability_slot_id])
      @appointment.update(availability_slot: new_slot)
      AppointmentMailer.confirmation_email(@appointment).deliver_now
      redirect_to admin_appointment_path(@appointment), notice: "Appointment was rescheduled."
    else
      redirect_to edit_admin_appointment_path(@appointment), alert: "Please select a new time slot."
    end
  end
  
  def complete
    @appointment.update(status: :completed)
    AppointmentMailer.completion_email(@appointment).deliver_now
    redirect_to admin_appointment_path(@appointment), notice: "Appointment was marked as completed."
  end
  
  def mark_no_show
    @appointment.update(status: :no_show)
    AppointmentMailer.no_show_email(@appointment).deliver_now
    redirect_to admin_appointment_path(@appointment), notice: "Appointment was marked as no-show."
  end
  
  private
  
  def set_appointment
    @appointment = Appointment.find(params[:id])
  end
  
  def appointment_params
    params.require(:appointment).permit(:availability_slot_id, :booking_name, :booking_email, :booking_phone, :status)
  end
end