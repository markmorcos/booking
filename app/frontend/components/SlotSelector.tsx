import React, { useState, useEffect } from "react";
import { AvailabilitySlot } from "../types";
import { format, parseISO, addDays, startOfWeek, addWeeks } from "date-fns";

interface SlotSelectorProps {
  onSelectSlot: (slot: AvailabilitySlot) => void;
}

const SlotSelector: React.FC<SlotSelectorProps> = ({ onSelectSlot }) => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  useEffect(() => {
    fetchSlots();
  }, [startDate]);

  const fetchSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const endDate = addDays(startDate, 14);
      const response = await fetch(
        `/availability_slots.json?start_date=${format(
          startDate,
          "yyyy-MM-dd"
        )}&end_date=${format(endDate, "yyyy-MM-dd")}`
      );

      if (response.ok) {
        const data = await response.json();
        setSlots(data);
      } else {
        setError("Failed to load availability slots");
      }
    } catch (err) {
      setError("An error occurred while fetching availability slots");
    } finally {
      setLoading(false);
    }
  };

  const handleNextWeek = () => {
    setStartDate(addWeeks(startDate, 1));
  };

  const handlePrevWeek = () => {
    setStartDate(addWeeks(startDate, -1));
  };

  const formatSlotTime = (slot: AvailabilitySlot) => {
    const start = parseISO(slot.start_time);
    const end = parseISO(slot.end_time);
    return `${format(start, "EEEE, MMMM d, yyyy")} at ${format(
      start,
      "h:mm a"
    )} - ${format(end, "h:mm a")}`;
  };

  if (loading) {
    return <div className="loading">Loading available slots...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={fetchSlots}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="slot-selector">
      <h2>Select an Appointment Time</h2>

      <div className="date-navigation">
        <button onClick={handlePrevWeek}>&larr; Previous Week</button>
        <span className="date-range">
          {format(startDate, "MMMM d, yyyy")} -{" "}
          {format(addDays(startDate, 6), "MMMM d, yyyy")}
        </span>
        <button onClick={handleNextWeek}>Next Week &rarr;</button>
      </div>

      {slots.length === 0 ? (
        <div className="no-slots">
          <p>No available slots for the selected date range.</p>
        </div>
      ) : (
        <ul className="slot-list">
          {slots.map((slot) => (
            <li key={slot.id} className="slot-item">
              <button onClick={() => onSelectSlot(slot)}>
                {formatSlotTime(slot)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SlotSelector;
