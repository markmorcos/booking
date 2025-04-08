class CleanupAvailabilitySlotsJob < ApplicationJob
  queue_as :default

  def perform
    # Find all past availability slots with no associated appointments
    past_slots = AvailabilitySlot.where("ends_at < ?", Time.current)
                                .left_joins(:appointment)
                                .where(appointments: { id: nil })
    
    # Log the count of slots to be deleted
    count = past_slots.count
    Rails.logger.info "Deleting #{count} past availability slots with no appointments"
    
    # Delete the past slots
    past_slots.destroy_all
    
    Rails.logger.info "Successfully deleted #{count} past availability slots"
  end
end