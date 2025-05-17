class AvailabilitySlotsController < ApplicationController
  def index
    @availability_slots = current_tenant.availability_slots
                                      .future
                                      .available
                                      .order(starts_at: :asc)
  end
end
