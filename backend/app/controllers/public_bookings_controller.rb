class PublicBookingsController < ApplicationController
  before_action :set_tenant

  def show
    @date = params[:date].present? ? Date.parse(params[:date]) : Date.today
    start_date = @date.beginning_of_month.beginning_of_week
    end_date = @date.end_of_month.end_of_week

    # Get all available slots for the month for calendar highlighting
    @month_slots = @tenant.availability_slots
      .available
      .where(starts_at: start_date.beginning_of_day..end_date.end_of_day)

    # Get slots for the selected date
    @availability_slots = @tenant.availability_slots
      .available
      .where(starts_at: @date.beginning_of_day..@date.end_of_day)
      .order(:starts_at)

    respond_to do |format|
      format.html
      format.turbo_stream { 
        render turbo_stream: turbo_stream.update("availability_slots", partial: "slots")
      }
    end
  end

  def details
    @slot = @tenant.availability_slots.available.find_by(id: params[:slot_id])
    if @slot.blank?
      redirect_to public_booking_path(@tenant.path), alert: "Slot not found"
      return
    end
    @user = User.new
    @appointment = Appointment.new(availability_slot: @slot, user: @user)
  end

  def create
    @slot = @tenant.availability_slots.available.find(params[:slot_id])
    @user = User.find_or_initialize_by(email: user_params[:email])
    @user.assign_attributes(user_params)
    @user.save!
    @appointment = @tenant.appointments.new(user: @user, availability_slot: @slot)

    if @appointment.save
      AppointmentMailer.status_email(@appointment).deliver_later
      redirect_to public_booking_confirmation_path(@appointment), notice: "Appointment booked successfully!"
    else
      render :details, status: :unprocessable_entity
    end
  end

  def confirmation
    @appointment = @tenant.appointments.find(params[:id])
  end

  def calendar
    @appointment = Appointment.find(params[:id])
    
    calendar = Icalendar::Calendar.new
    calendar.event do |e|
      e.dtstart = @appointment.availability_slot.starts_at
      e.dtend = @appointment.availability_slot.ends_at
      e.summary = "Meeting with #{@appointment.tenant.owner.name}"
      e.description = "Video call meeting with #{@appointment.tenant.owner.name}"
      e.organizer = "mailto:#{@appointment.tenant.owner.email}"
      e.attendee = "mailto:#{@appointment.user.email}"
    end

    calendar.publish

    send_data calendar.to_ical, 
      filename: "meeting-with-#{@appointment.tenant.owner.name.parameterize}.ics",
      type: "text/calendar",
      disposition: "attachment"
  end

  private

  def set_tenant
    @tenant = Tenant.find_by(path: params[:tenant_path])
    redirect_to root_path, alert: "Calendar not found" if @tenant.blank?
  end

  def default_url_options
    { tenant_path: params[:tenant_path] }
  end

  def user_params
    params.require(:user).permit(:name, :email, :phone)
  end
end 