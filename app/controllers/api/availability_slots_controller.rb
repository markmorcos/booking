module Api
  class AvailabilitySlotsController < Api::BaseController
    # GET /api/availability_slots
    def index
      # Only return slots that are available (don't have an appointment)
      @availability_slots = AvailabilitySlot
                              .left_joins(:appointment)
                              .where(appointments: { id: nil })
                              .where("ends_at > ?", Time.current) # Only future slots

      # Filter by date range if provided
      if params[:start_date].present? && params[:end_date].present?
        start_date = Date.parse(params[:start_date]).beginning_of_day
        end_date = Date.parse(params[:end_date]).end_of_day
        @availability_slots = @availability_slots.where("starts_at >= ? AND ends_at <= ?", start_date, end_date)
      end

      # Order by start time
      @availability_slots = @availability_slots.order(starts_at: :asc)

      render json: @availability_slots
    end
  end
end
