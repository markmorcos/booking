class Admin::AvailabilitySlotsController < Admin::BaseController
  before_action :set_availability_slot, only: [ :show, :edit, :update, :destroy ]

  def index
    @availability_slots = AvailabilitySlot.order(:starts_at)

    if params[:filter] == "available"
      @availability_slots = @availability_slots.available
    elsif params[:filter] == "future"
      @availability_slots = @availability_slots.future
    elsif params[:filter] == "future_available"
      @availability_slots = @availability_slots.future.available
    end

    if params[:date].present?
      date = Time.zone.parse(params[:date]).to_date
      @availability_slots = @availability_slots.where("DATE(starts_at) = ?", date)
    end

    @availability_slots = @availability_slots.page(params[:page]).per(10)
  end

  def show
  end

  def new
    @availability_slot = AvailabilitySlot.new
  end

  def create
    @availability_slot = AvailabilitySlot.new(availability_slot_params)

    if @availability_slot.save
      redirect_to admin_availability_slot_path(@availability_slot), notice: "Availability slot was successfully created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @availability_slot.update(availability_slot_params)
      redirect_to admin_availability_slot_path(@availability_slot), notice: "Availability slot was successfully updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @availability_slot.destroy
    redirect_to admin_availability_slots_path, notice: "Availability slot was successfully deleted."
  end

  def new_batch
  end

  def create_batch
    start_date = Time.zone.parse(params[:start_date]).to_date
    end_date   = Time.zone.parse(params[:end_date]).to_date
    start_time = Time.zone.parse(params[:start_time])
    end_time   = Time.zone.parse(params[:end_time])
    duration   = params[:duration].to_i.minutes
    weekdays   = params[:weekdays] || []

    created_count = 0

    (start_date..end_date).each do |date|
      next unless weekdays.include?(date.wday.to_s)

      current_time = Time.zone.local(date.year, date.month, date.day, start_time.hour, start_time.min)
      end_of_day   = Time.zone.local(date.year, date.month, date.day, end_time.hour, end_time.min)

      while current_time + duration <= end_of_day
        slot = AvailabilitySlot.new(
          starts_at: current_time,
          ends_at: current_time + duration
        )

        created_count += 1 if slot.save
        current_time += duration
      end
    end

    redirect_to admin_availability_slots_path, notice: "Successfully created #{created_count} availability slots."
  end

  def delete_range
    start_date = Time.zone.parse(params[:start_date]).to_date
    end_date = Time.zone.parse(params[:end_date]).to_date

    slots = AvailabilitySlot.where("DATE(starts_at) >= ? AND DATE(starts_at) <= ?", start_date, end_date)

    available_slots = slots.available
    deleted_count = available_slots.count
    available_slots.destroy_all

    redirect_to admin_availability_slots_path, notice: "Successfully deleted #{deleted_count} availability slots."
  end

  private

  def set_availability_slot
    @availability_slot = AvailabilitySlot.find(params[:id])
  end

  def availability_slot_params
    params.require(:availability_slot).permit(:starts_at, :ends_at)
  end
end
