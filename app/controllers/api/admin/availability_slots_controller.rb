module Api
  module Admin
    class AvailabilitySlotsController < Api::Admin::BaseController
      before_action :set_availability_slot, only: [ :show, :update, :destroy ]

      # GET /api/admin/availability_slots
      def index
        @availability_slots = AvailabilitySlot.all

        # Filter by date range if provided
        if params[:start_date].present? && params[:end_date].present?
          start_date = Date.parse(params[:start_date]).beginning_of_day
          end_date = Date.parse(params[:end_date]).end_of_day
          @availability_slots = @availability_slots.where("starts_at >= ? AND ends_at <= ?", start_date, end_date)
        end

        render json: { data: @availability_slots }
      end

      # GET /api/admin/availability_slots/:id
      def show
        render json: { data: @availability_slot }
      end

      # POST /api/admin/availability_slots
      def create
        @availability_slot = AvailabilitySlot.new(availability_slot_params)

        if @availability_slot.save
          render json: { data: @availability_slot }, status: :created
        else
          render json: { errors: @availability_slot.errors }, status: :unprocessable_entity
        end
      end

      # POST /api/admin/availability_slots/create_batch
      # Creates multiple slots in a date range with a specified duration
      def create_batch
        start_date = Time.zone.parse(params[:start_date])
        end_date = Time.zone.parse(params[:end_date])
        duration_minutes = params[:duration_minutes].to_i

        # Validate inputs
        if start_date.nil? || end_date.nil? || duration_minutes <= 0
          return render json: { errors: [ "Invalid parameters" ] }, status: :unprocessable_entity
        end

        # Generate slots
        slots = []
        current_time = start_date

        while current_time + duration_minutes.minutes <= end_date
          slot_end = current_time + duration_minutes.minutes

          # Check for overlap with existing slots
          if !slot_overlaps?(current_time, slot_end)
            slots << AvailabilitySlot.new(
              starts_at: current_time,
              ends_at: slot_end
            )
          end

          # Move to next slot time
          current_time = slot_end
        end

        # Save all slots in a transaction
        AvailabilitySlot.transaction do
          if slots.all?(&:save)
            render json: slots, status: :created
          else
            # Collect all error messages
            error_messages = slots.map { |s| s.errors.full_messages if s.errors.any? }.compact
            raise ActiveRecord::Rollback
            render json: { errors: error_messages }, status: :unprocessable_entity
          end
        end
      end

      # PATCH /api/admin/availability_slots/update_durations
      # Updates the duration of slots in a date range
      def update_durations
        start_date = Time.zone.parse(params[:start_date])
        end_date = Time.zone.parse(params[:end_date])
        new_duration_minutes = params[:duration_minutes].to_i

        # Validate inputs
        if start_date.nil? || end_date.nil? || new_duration_minutes <= 0
          return render json: { errors: [ "Invalid parameters" ] }, status: :unprocessable_entity
        end

        # Find slots in the date range
        slots = AvailabilitySlot.where("starts_at >= ? AND starts_at <= ?", start_date, end_date)

        # Update slots duration
        updated_slots = []
        errors = []

        AvailabilitySlot.transaction do
          slots.each do |slot|
            # Calculate new end time
            new_end_time = slot.starts_at + new_duration_minutes.minutes

            # Skip slots with appointments
            next if slot.appointment.present?

            if slot.update(ends_at: new_end_time)
              updated_slots << slot
            else
              errors << "Failed to update slot #{slot.id}: #{slot.errors.full_messages.join(', ')}"
            end
          end

          if errors.any?
            raise ActiveRecord::Rollback
            render json: { errors: errors }, status: :unprocessable_entity
          else
            render json: { data: { slots: updated_slots } }
          end
        end
      end

      # DELETE /api/admin/availability_slots/:id
      def destroy
        if @availability_slot.appointment.present?
          render json: { errors: [ "Cannot delete slot with an appointment" ] }, status: :unprocessable_entity
        else
          @availability_slot.destroy
          head :no_content
        end
      end

      # DELETE /api/admin/availability_slots/delete_range
      # Deletes slots in a date range that don't have appointments
      def delete_range
        start_date = Time.zone.parse(params[:start_date])
        end_date = Time.zone.parse(params[:end_date])

        # Validate inputs
        if start_date.nil? || end_date.nil?
          return render json: { errors: [ "Invalid date parameters" ] }, status: :unprocessable_entity
        end

        # Find slots in the date range that don't have appointments
        slots_to_delete = AvailabilitySlot
                            .left_joins(:appointment)
                            .where("starts_at >= ? AND starts_at <= ?", start_date, end_date)
                            .where(appointments: { id: nil })

        if slots_to_delete.destroy_all
          head :no_content
        else
          render json: { errors: [ "Failed to delete slots" ] }, status: :unprocessable_entity
        end
      end

      private

      def set_availability_slot
        @availability_slot = AvailabilitySlot.find(params[:id])
      end

      def availability_slot_params
        params.require(:availability_slot).permit(:starts_at, :ends_at)
      end

      # Check if a slot overlaps with existing slots
      def slot_overlaps?(start_time, end_time)
        AvailabilitySlot.where(
          "(starts_at < ? AND ends_at > ?) OR (starts_at < ? AND ends_at > ?) OR (starts_at >= ? AND ends_at <= ?)",
          end_time, start_time, # First condition: new slot starts before existing slot ends AND new slot ends after existing slot starts
          end_time, start_time, # Second condition: existing slot starts before new slot ends AND existing slot ends after new slot starts
          start_time, end_time  # Third condition: new slot is contained within existing slot
        ).exists?
      end
    end
  end
end
