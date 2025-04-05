module Admin
  class AppointmentsController < BaseController
    before_action :set_appointment, only: [:show, :edit, :update, :destroy, :confirm, :cancel]

    def index
      @appointments = Appointment.includes(:availability_slot).order('availability_slots.start_time DESC')
      
      if params[:status].present?
        @appointments = @appointments.where(status: params[:status])
      end
      
      if params[:start_date].present?
        start_date = Date.parse(params[:start_date])
        end_date = params[:end_date].present? ? Date.parse(params[:end_date]) : nil
        @appointments = @appointments.date_range(start_date, end_date)
      end
      
      @appointments = @appointments.page(params[:page]).per(20)
    end

    def show
    end

    def edit
    end

    def update
      if @appointment.update(appointment_params)
        redirect_to admin_appointment_path(@appointment), notice: 'Appointment was successfully updated.'
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @appointment.destroy
      redirect_to admin_appointments_path, notice: 'Appointment was successfully deleted.', status: :see_other
    end
    
    def confirm
      @appointment.confirm!
      redirect_to admin_appointment_path(@appointment), notice: 'Appointment was successfully confirmed.'
    end
    
    def cancel
      @appointment.cancel!
      redirect_to admin_appointment_path(@appointment), notice: 'Appointment was successfully cancelled.'
    end

    private

    def set_appointment
      @appointment = Appointment.find(params[:id])
    end

    def appointment_params
      params.require(:appointment).permit(:name, :email, :phone, :notes, :status)
    end
  end
end 