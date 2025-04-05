module Api
  class AppointmentsController < Api::BaseController
    # POST /api/appointments
    def create
      # Find the availability slot
      availability_slot = AvailabilitySlot.find(params[:availability_slot_id])

      # Check if slot is already booked
      if availability_slot.appointment.present?
        render json: { errors: [ "This slot is already booked" ] }, status: :unprocessable_entity
        return
      end

      # Check if slot is in the past
      if availability_slot.starts_at < Time.current
        render json: { errors: [ "Cannot book appointments in the past" ] }, status: :unprocessable_entity
        return
      end

      # Create the appointment
      @appointment = Appointment.new(appointment_params)
      @appointment.availability_slot = availability_slot

      if @appointment.save
        render json: { data: @appointment }, status: :created
      else
        render json: { errors: @appointment.errors }, status: :unprocessable_entity
      end
    end

    private

    def appointment_params
      params.require(:appointment).permit(:booking_name, :booking_email)
    end
  end
end
