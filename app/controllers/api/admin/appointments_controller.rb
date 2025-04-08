module Api
  module Admin
    class AppointmentsController < Api::Admin::BaseController
      before_action :set_appointment, only: [ :show, :update, :destroy, :approve, :cancel, :reschedule, :complete, :mark_no_show ]

      # GET /api/admin/appointments
      def index
        @appointments = Appointment.all.includes(:availability_slot)

        if params[:status].present?
          @appointments = @appointments.where(status: params[:status])
        end

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

      # PATCH/PUT /api/admin/appointments/:id
      def update
        if @appointment.update(appointment_params)
          render json: { data: @appointment }
        else
          render json: { errors: @appointment.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/admin/appointments/:id
      def destroy
        @appointment.destroy
        head :no_content
      end

      # PATCH /api/admin/appointments/:id/approve
      def approve
        if @appointment.status != "pending"
          render json: { errors: [ "Only pending appointments can be approved" ] }, status: :unprocessable_entity
          return
        end

        if @appointment.update(status: :confirmed)
          AppointmentMailer.confirmation_email(@appointment).deliver_now
          render json: { data: @appointment }
        else
          render json: { errors: @appointment.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH /api/admin/appointments/:id/cancel
      def cancel
        if @appointment.status == "cancelled"
          render json: { errors: [ "Appointment is already cancelled" ] }, status: :unprocessable_entity
          return
        end

        if @appointment.update(status: :cancelled)
          AppointmentMailer.cancellation_email(@appointment).deliver_now
          render json: { data: @appointment }
        else
          render json: { errors: @appointment.errors.full_messages }, status: :unprocessable_entity
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

          if new_slot.appointment.present?
            render json: { errors: [ "Selected slot is already booked" ] }, status: :unprocessable_entity
            return
          end

          Appointment.transaction do
            @appointment.update(status: :cancelled)

            @new_appointment = Appointment.create!(
              availability_slot: new_slot,
              booking_name: @appointment.booking_name,
              booking_email: @appointment.booking_email,
              status: :confirmed
            )

            AppointmentMailer.confirmation_email(@new_appointment).deliver_now
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

        if @appointment.update(status: :completed)
          AppointmentMailer.completion_email(@appointment).deliver_now
          render json: { data: @appointment }
        else
          render json: { errors: @appointment.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH /api/admin/appointments/:id/mark_no_show
      def mark_no_show
        if @appointment.status != "confirmed"
          render json: { errors: [ "Only confirmed appointments can be marked as no-show" ] }, status: :unprocessable_entity
          return
        end

        if @appointment.update(status: :no_show)
          AppointmentMailer.no_show_email(@appointment).deliver_now
          render json: { data: @appointment }
        else
          render json: { errors: @appointment.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_appointment
        @appointment = Appointment.find(params[:id])
      end

      def appointment_params
        params.require(:appointment).permit(:booking_name, :booking_email, :booking_phone)
      end
    end
  end
end
