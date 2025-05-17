class Admin::AvailabilitySlotsController < Admin::BaseController
  before_action :set_availability_slot, only: [ :show, :edit, :update, :destroy ]

  def index
    @availability_slots = current_tenant.availability_slots.order(:starts_at)

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
    @availability_slot = current_tenant.availability_slots.new
  end

  def edit
  end

  def create
    @availability_slot = current_tenant.availability_slots.new(availability_slot_params)

    if @availability_slot.save
      redirect_to admin_availability_slot_path(@availability_slot), notice: "Availability slot was successfully created."
    else
      render :new, status: :unprocessable_entity
    end
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
    redirect_to admin_availability_slots_path, notice: "Availability slot was successfully destroyed."
  end

  def new_batch
    @availability_slot = current_tenant.availability_slots.new
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
        slot = current_tenant.availability_slots.new(
          starts_at: current_time,
          ends_at: current_time + duration
        )

        created_count += 1 if slot.save
        current_time += duration
      end
    end

    redirect_to admin_availability_slots_path, notice: "#{created_count} availability slots were successfully created."
  end

  def update_durations
    if params[:duration].blank?
      redirect_to admin_availability_slots_path, alert: "Duration is required."
      return
    end

    current_tenant.availability_slots.update_all(duration: params[:duration])
    redirect_to admin_availability_slots_path, notice: "All availability slots were updated with the new duration."
  end

  def delete_range
    if params[:start_date].blank? || params[:end_date].blank?
      redirect_to admin_availability_slots_path, alert: "Start date and end date are required."
      return
    end

    start_date = Date.parse(params[:start_date])
    end_date = Date.parse(params[:end_date])

    deleted_count = current_tenant.availability_slots
                                .where("DATE(starts_at) BETWEEN ? AND ?", start_date, end_date)
                                .destroy_all
                                .count

    redirect_to admin_availability_slots_path, notice: "#{deleted_count} availability slots were successfully deleted."
  end

  private

  def set_availability_slot
    @availability_slot = current_tenant.availability_slots.find(params[:id])
  end

  def availability_slot_params
    params.require(:availability_slot).permit(:starts_at, :ends_at, :duration)
  end
end
