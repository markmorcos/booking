# app/controllers/api/v1/appointments_controller.rb
module Api
  module V1
    class AppointmentsController < BaseController
      before_action :authenticate_admin_user!, only: [:index, :show, :update]
      before_action :set_appointment, only: [:show, :update]
      
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
        
        # Apply pagination
        page = (params[:page] || 1).to_i
        per_page = (params[:per_page] || 20).to_i
        total_count = @appointments.count
        total_pages = (total_count.to_f / per_page).ceil
        
        @appointments = @appointments.limit(per_page).offset((page - 1) * per_page)
        
        render json: {
          appointments: @appointments.map { |appointment| appointment_to_json(appointment) },
          meta: {
            page: page,
            total_pages: total_pages,
            total_count: total_count
          }
        }
      end
      
      def show
        render json: appointment_to_json(@appointment)
      end
      
      def create
        # Check if the slot is available
        slot = AvailabilitySlot.find(appointment_params[:availability_slot_id])
        
        if slot.booked?
          render json: { errors: { availability_slot_id: ["Slot is already booked"] } }, status: :unprocessable_entity
          return
        end
        
        @appointment = Appointment.new(appointment_params)
        
        if @appointment.save
          render json: appointment_to_json(@appointment), status: :created
        else
          render json: { errors: @appointment.errors }, status: :unprocessable_entity
        end
      end
      
      def update
        if @appointment.update(update_params)
          render json: appointment_to_json(@appointment)
        else
          render json: { errors: @appointment.errors }, status: :unprocessable_entity
        end
      end
      
      private
      
      def set_appointment
        @appointment = Appointment.find(params[:id])
      end
      
      def appointment_params
        params.require(:appointment).permit(:availability_slot_id, :name, :email, :phone, :notes)
      end
      
      def update_params
        params.require(:appointment).permit(:status)
      end
      
      def appointment_to_json(appointment)
        {
          id: appointment.id,
          status: appointment.status,
          name: appointment.name,
          email: appointment.email,
          phone: appointment.phone,
          notes: appointment.notes,
          created_at: appointment.created_at,
          slot: {
            id: appointment.availability_slot.id,
            start_time: appointment.availability_slot.start_time,
            end_time: appointment.availability_slot.end_time
          }
        }
      end
    end
  end
end 