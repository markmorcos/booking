module Api
  class AppointmentsController < Api::BaseController
    # GET /api/appointments
    def index
      @appointments = Appointment
                        .where(booking_email: params[:email])
                        .includes(:availability_slot)
                        .future

      render json: @appointments, status: :ok
    end

    # POST /api/appointments
    def create
      begin
        availability_slot = AvailabilitySlot.find(params[:availability_slot_id])
      rescue ActiveRecord::RecordNotFound
        render json: { errors: [ "Availability slot not found" ] }, status: :not_found
        return
      end

      if availability_slot.appointment.present?
        render json: { errors: [ "This slot is already booked" ] }, status: :unprocessable_entity
        return
      end

      if availability_slot.starts_at < Time.current
        render json: { errors: [ "Cannot book appointments in the past" ] }, status: :unprocessable_entity
        return
      end

      @appointment = Appointment.new(appointment_params)
      @appointment.availability_slot = availability_slot

      if @appointment.save
        AppointmentMailer.pending_email(@appointment).deliver_now
        render json: @appointment, status: :created
      else
        render json: { errors: @appointment.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def appointment_params
      params.require(:appointment).permit(:booking_name, :booking_email, :booking_phone, :status)
    end
  end
end
