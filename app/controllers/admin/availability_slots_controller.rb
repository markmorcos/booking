module Admin
  class AvailabilitySlotsController < BaseController
    before_action :set_availability_slot, only: [:show, :edit, :update, :destroy]

    def index
      @availability_slots = AvailabilitySlot.order(start_time: :desc)
      
      if params[:status] == 'available'
        @availability_slots = @availability_slots.available
      elsif params[:status] == 'booked'
        @availability_slots = @availability_slots.booked
      end
      
      if params[:start_date].present?
        start_date = Date.parse(params[:start_date])
        end_date = params[:end_date].present? ? Date.parse(params[:end_date]) : nil
        @availability_slots = @availability_slots.date_range(start_date, end_date)
      end
      
      @availability_slots = @availability_slots.page(params[:page]).per(20)
    end

    def show
    end

    def new
      @availability_slot = AvailabilitySlot.new
    end

    def edit
    end

    def create
      @availability_slot = AvailabilitySlot.new(availability_slot_params)

      if @availability_slot.save
        redirect_to admin_availability_slot_path(@availability_slot), notice: 'Availability slot was successfully created.'
      else
        render :new, status: :unprocessable_entity
      end
    end

    def update
      if @availability_slot.update(availability_slot_params)
        redirect_to admin_availability_slot_path(@availability_slot), notice: 'Availability slot was successfully updated.'
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      if @availability_slot.appointment.present?
        redirect_to admin_availability_slots_path, alert: 'Cannot delete slot with an existing appointment.'
      else
        @availability_slot.destroy
        redirect_to admin_availability_slots_path, notice: 'Availability slot was successfully deleted.', status: :see_other
      end
    end

    private

    def set_availability_slot
      @availability_slot = AvailabilitySlot.find(params[:id])
    end

    def availability_slot_params
      params.require(:availability_slot).permit(:start_time, :end_time)
    end
  end
end 