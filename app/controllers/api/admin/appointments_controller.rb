module Api
  module Admin
    class AppointmentsController < Api::Admin::BaseController
      before_action :set_appointment, only: [ :show, :approve, :cancel, :reschedule, :complete, :mark_no_show ]

      # GET /api/admin/appointments
      def index
        @appointments = Appointment.all.includes(:availability_slot)

        # Filter by status
        if params[:status].present?
          @appointments = @appointments.where(status: params[:status])
        end

        # Filter by date range
        if params[:start_date].present? && params[:end_date].present?
          start_date = Date.parse(params[:start_date]).beginning_of_day
          end_date = Date.parse(params[:end_date]).end_of_day

          @appointments = @appointments.joins(:availability_slot)
                                      .where("availability_slots.starts_at >= ? AND availability_slots.starts_at <= ?",
                                            start_date, end_date)
        end

        render json: { data: @appointments, include: :availability_slot }
      end

      # GET /api/admin/appointments/:id
      def show
        render json: { data: @appointment, include: :availability_slot }
      end

      # PATCH /api/admin/appointments/:id/approve
      def approve
        if @appointment.status != "pending"
          render json: { errors: [ "Only pending appointments can be approved" ] }, status: :unprocessable_entity
          return
        end

        if @appointment.confirm!
          render json: { data: @appointment }
        else
          render json: { errors: @appointment.errors }, status: :unprocessable_entity
        end
      end

      # PATCH /api/admin/appointments/:id/cancel
      def cancel
        if @appointment.status == "cancelled"
          render json: { errors: [ "Appointment is already cancelled" ] }, status: :unprocessable_entity
          return
        end

        if @appointment.cancel!
          render json: { data: @appointment }
        else
          render json: { errors: @appointment.errors }, status: :unprocessable_entity
        end
      end

      # PATCH /api/admin/appointments/:id/reschedule
      def reschedule
        new_slot_id = params[:availability_slot_id]

        if new_slot_id.blank?
          render json: { errors: [ "New availability slot ID is required" ] }, status: :unprocessable_entity
          return
        end

        begin
          new_slot = AvailabilitySlot.find(new_slot_id)

          # Check if new slot is available
          if new_slot.appointment.present?
            render json: { errors: [ "Selected slot is already booked" ] }, status: :unprocessable_entity
            return
          end

          # Perform rescheduling in a transaction
          Appointment.transaction do
            # Cancel current appointment
            @appointment.cancel!

            # Create new appointment with same details but new slot
            @new_appointment = Appointment.create!(
              availability_slot: new_slot,
              booking_name: @appointment.booking_name,
              booking_email: @appointment.booking_email,
              status: :confirmed # Directly confirm the rescheduled appointment
            )

            # No need to call confirm! as it would send another email
            # Instead manually send the confirmation email
            AppointmentMailer.confirmation_email(@new_appointment).deliver_later
          end

          render json: { data: @new_appointment }
        rescue ActiveRecord::RecordNotFound
          render json: { errors: [ "New availability slot not found" ] }, status: :not_found
        rescue => e
          render json: { errors: [ e.message ] }, status: :unprocessable_entity
        end
      end

      # PATCH /api/admin/appointments/:id/complete
      def complete
        if @appointment.status != "confirmed"
          render json: { errors: [ "Only confirmed appointments can be completed" ] }, status: :unprocessable_entity
          return
        end

        if @appointment.complete!
          render json: { data: @appointment }
        else
          render json: { errors: @appointment.errors }, status: :unprocessable_entity
        end
      end

      # PATCH /api/admin/appointments/:id/mark_no_show
      def mark_no_show
        if @appointment.status != "confirmed"
          render json: { errors: [ "Only confirmed appointments can be marked as no-show" ] }, status: :unprocessable_entity
          return
        end

        if @appointment.no_show!
          render json: { data: @appointment }
        else
          render json: { errors: @appointment.errors }, status: :unprocessable_entity
        end
      end

      private

      def set_appointment
        @appointment = Appointment.find(params[:id])
      end
    end
  end
end
