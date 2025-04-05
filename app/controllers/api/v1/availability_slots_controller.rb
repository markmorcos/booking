# app/controllers/api/v1/availability_slots_controller.rb
module Api
  module V1
    class AvailabilitySlotsController < BaseController
      before_action :authenticate_admin_user!, only: [:create, :destroy]
      before_action :set_availability_slot, only: [:destroy]
      
      def index
        start_date = params[:start_date].present? ? Date.parse(params[:start_date]) : Date.today
        end_date = params[:end_date].present? ? Date.parse(params[:end_date]) : start_date + 30.days
        
        @availability_slots = AvailabilitySlot.upcoming
                                              .date_range(start_date, end_date)
                                              .order(start_time: :asc)
        
        # If not authenticated, only show available slots
        unless current_admin_user
          @availability_slots = @availability_slots.available
        end
        
        render json: {
          availability_slots: @availability_slots.map { |slot| slot_to_json(slot) }
        }
      end
      
      def create
        @availability_slot = AvailabilitySlot.new(availability_slot_params)
        
        if @availability_slot.save
          render json: slot_to_json(@availability_slot), status: :created
        else
          render json: { errors: @availability_slot.errors }, status: :unprocessable_entity
        end
      end
      
      def destroy
        @availability_slot.destroy
        head :no_content
      end
      
      private
      
      def set_availability_slot
        @availability_slot = AvailabilitySlot.find(params[:id])
      end
      
      def availability_slot_params
        params.require(:availability_slot).permit(:start_time, :end_time)
      end
      
      def slot_to_json(slot)
        {
          id: slot.id,
          start_time: slot.start_time,
          end_time: slot.end_time,
          booked: slot.booked?
        }
      end
    end
  end
end 