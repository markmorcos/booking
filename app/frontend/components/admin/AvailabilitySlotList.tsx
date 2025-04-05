import React, { useState, useEffect } from "react";
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
} from "date-fns";

interface AvailabilitySlot {
  id: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  appointment_id: number | null;
}

interface WeeklySlots {
  [date: string]: AvailabilitySlot[];
}

const AvailabilitySlotList: React.FC = () => {
  const [slots, setSlots] = useState<WeeklySlots>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states for creating new slots
  const [newSlotDate, setNewSlotDate] = useState<string>("");
  const [newSlotStartTime, setNewSlotStartTime] = useState<string>("09:00");
  const [newSlotEndTime, setNewSlotEndTime] = useState<string>("09:30");

  useEffect(() => {
    fetchWeeklySlots();
  }, [currentWeekStart]);

  const fetchWeeklySlots = async () => {
    try {
      setLoading(true);

      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      const formattedStart = format(currentWeekStart, "yyyy-MM-dd");
      const formattedEnd = format(weekEnd, "yyyy-MM-dd");

      const response = await fetch(
        `/admin/availability_slots.json?start_date=${formattedStart}&end_date=${formattedEnd}`,
        {
          headers: {
            Accept: "application/json",
            "X-CSRF-Token":
              document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch availability slots");
      }

      const data = await response.json();

      // Organize slots by date
      const organizedSlots: WeeklySlots = {};
      data.slots.forEach((slot: AvailabilitySlot) => {
        const date = format(parseISO(slot.start_time), "yyyy-MM-dd");
        if (!organizedSlots[date]) {
          organizedSlots[date] = [];
        }
        organizedSlots[date].push(slot);
      });

      setSlots(organizedSlots);
    } catch (err) {
      setError("Failed to load availability slots. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/admin/availability_slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-Token":
            document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content") || "",
        },
        body: JSON.stringify({
          availability_slot: {
            start_time: `${newSlotDate}T${newSlotStartTime}:00`,
            end_time: `${newSlotDate}T${newSlotEndTime}:00`,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create availability slot");
      }

      // Refresh slots
      await fetchWeeklySlots();
      setShowCreateModal(false);

      // Reset form
      setNewSlotDate("");
      setNewSlotStartTime("09:00");
      setNewSlotEndTime("09:30");
    } catch (err) {
      setError("Failed to create availability slot. Please try again.");
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    if (!confirm("Are you sure you want to delete this availability slot?")) {
      return;
    }

    try {
      const response = await fetch(`/admin/availability_slots/${slotId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "X-CSRF-Token":
            document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content") || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete availability slot");
      }

      // Refresh slots
      await fetchWeeklySlots();
    } catch (err) {
      setError("Failed to delete availability slot. Please try again.");
    }
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${format(parseISO(startTime), "h:mm a")} - ${format(
      parseISO(endTime),
      "h:mm a"
    )}`;
  };

  const getWeekDateRange = () => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return `${format(currentWeekStart, "MMM d")} - ${format(
      weekEnd,
      "MMM d, yyyy"
    )}`;
  };

  if (loading && Object.keys(slots).length === 0) {
    return (
      <div className="loading-indicator">Loading availability slots...</div>
    );
  }

  return (
    <div className="admin-slots">
      <div className="flex justify-between items-center mb-6">
        <h1>Availability Slots</h1>
        <button
          className="admin-button admin-button-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Add New Slot
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="date-navigation admin-card">
        <button
          onClick={handlePreviousWeek}
          className="admin-button admin-button-secondary"
        >
          Previous Week
        </button>
        <h2 className="m-0 text-xl font-bold">{getWeekDateRange()}</h2>
        <button
          onClick={handleNextWeek}
          className="admin-button admin-button-secondary"
        >
          Next Week
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {Array.from({ length: 7 }).map((_, index) => {
          const date = new Date(currentWeekStart);
          date.setDate(currentWeekStart.getDate() + index);
          const formattedDate = format(date, "yyyy-MM-dd");
          const daySlots = slots[formattedDate] || [];

          return (
            <div key={formattedDate} className="admin-card">
              <h3 className="admin-section-title">
                {format(date, "EEEE")}
                <span className="block text-sm font-normal">
                  {format(date, "MMM d, yyyy")}
                </span>
              </h3>

              {daySlots.length === 0 ? (
                <div className="admin-empty-state text-sm py-4">
                  No slots available
                </div>
              ) : (
                <ul className="space-y-2">
                  {daySlots.map((slot) => (
                    <li
                      key={slot.id}
                      className="flex justify-between items-center p-2 border-b"
                    >
                      <div>
                        <div>
                          {formatTimeRange(slot.start_time, slot.end_time)}
                        </div>
                        {!slot.is_available && (
                          <div className="text-sm text-red-500">Booked</div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {slot.is_available && (
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete Slot"
                          >
                            Delete
                          </button>
                        )}
                        {!slot.is_available && slot.appointment_id && (
                          <a
                            href={`/admin/appointments/${slot.appointment_id}`}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            View Appointment
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                Create New Availability Slot
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSlot}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label className="form-label">Date:</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newSlotDate}
                    onChange={(e) => setNewSlotDate(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Start Time:</label>
                    <input
                      type="time"
                      className="form-input"
                      value={newSlotStartTime}
                      onChange={(e) => setNewSlotStartTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Time:</label>
                    <input
                      type="time"
                      className="form-input"
                      value={newSlotEndTime}
                      onChange={(e) => setNewSlotEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="admin-button admin-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-button admin-button-primary"
                >
                  Create Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilitySlotList;
