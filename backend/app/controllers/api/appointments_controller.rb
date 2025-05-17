require_relative "../../services/whatsapp_service"

module Api
  class AppointmentsController < Api::BaseController
    include AppointmentStatusHandler

    # GET /api/appointments
    def index
      @appointments = current_tenant.appointments
                                 .includes(:user, :availability_slot)
                                 .where(user: { email: params[:email] })
                                 .future

      render json: @appointments, status: :ok
    end

    # POST /api/appointments
    def create
      begin
        availability_slot = current_tenant.availability_slots.find(params[:availability_slot_id])
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

      @appointment = current_tenant.appointments.new(appointment_params)
      @appointment.availability_slot = availability_slot

      # Ensure we set the user from params or current_user
      @appointment.user = if params.dig(:appointment, :user_id).present?
                            User.find_by(id: params.dig(:appointment, :user_id))
      else
                            current_user
      end

      if @appointment.save
        if handle_status_change(@appointment, :pending)
          render json: @appointment, status: :created
        else
          render json: { errors: [ "Failed to set appointment status" ] }, status: :unprocessable_entity
        end
      else
        render json: { errors: @appointment.errors.full_messages }, status: :unprocessable_entity
      end
    rescue StandardError => e
      render json: { errors: [ "Failed to create appointment: #{e.message}" ] }, status: :unprocessable_entity
    end

    # PATCH /api/appointments/:id/cancel
    def cancel
      begin
        @appointment = current_tenant.appointments.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { errors: [ "Appointment not found" ] }, status: :not_found
        return
      end

      if @appointment.cancelled?
        render json: { errors: [ "Appointment is already cancelled" ] }, status: :unprocessable_entity
        return
      end

      if @appointment.completed? || @appointment.no_show?
        render json: { errors: [ "Cannot cancel a completed or no-show appointment" ] }, status: :unprocessable_entity
        return
      end

      if handle_status_change(@appointment, :cancelled)
        render json: @appointment, status: :ok
      else
        render json: { errors: [ "Failed to cancel appointment" ] }, status: :unprocessable_entity
      end
    rescue StandardError => e
      render json: { errors: [ "Failed to cancel appointment: #{e.message}" ] }, status: :unprocessable_entity
    end

    private

    def appointment_params
      params.require(:appointment).permit(:booking_email, :booking_name, :booking_phone)
    end
  end
end
