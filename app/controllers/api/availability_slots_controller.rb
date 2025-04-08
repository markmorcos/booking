module Api
  class AvailabilitySlotsController < Api::BaseController
    # GET /api/availability_slots
    def index
      # Start with all future slots
      @availability_slots = AvailabilitySlot.where("ends_at > ?", Time.current)

      if params[:month].present?
        # Parse month in YYYY-MM format and include all slots for that month
        year, month = params[:month].split("-").map(&:to_i)
        start_date = Date.new(year, month, 1).beginning_of_day
        end_date = start_date.end_of_month.end_of_day
        @availability_slots = @availability_slots.where("starts_at >= ? AND ends_at <= ?", start_date, end_date)
      elsif params[:start_date].present? && params[:end_date].present?
        # Date range filtering - only show available slots
        start_date = Date.parse(params[:start_date]).beginning_of_day
        end_date = Date.parse(params[:end_date]).end_of_day
        @availability_slots = @availability_slots
                                .left_joins(:appointment)
                                .where(appointments: { id: nil })
                                .where("starts_at >= ? AND ends_at <= ?", start_date, end_date)
      else
        # Default behavior - only show available slots
        @availability_slots = @availability_slots
                                .left_joins(:appointment)
                                .where(appointments: { id: nil })
      end

      @availability_slots = @availability_slots.order(starts_at: :asc)

      render json: @availability_slots, status: :ok
    end
  end
end
