import { useSignal } from "@preact/signals";

import { AvailabilitySlot } from "../utils/supabase.ts";
import {
  CalendarIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "../components/Icons.tsx";
import { formatTime, formatDate } from "../components/SlotList.tsx";

// Group slots by date (can stay outside useEffect since it doesn't mutate state)
const groupSlotsByDate = (slots: AvailabilitySlot[]) => {
  return slots.reduce((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, AvailabilitySlot[]>);
};

interface SlotListProps {
  slots: AvailabilitySlot[];
  onSelect?: (slot: AvailabilitySlot) => void;
  isAdmin?: boolean;
  collapsible?: boolean;
}

export default function SlotList({
  slots,
  onSelect,
  isAdmin = false,
  collapsible = false,
}: SlotListProps) {
  // State to track which dates are expanded
  const expandedDates = useSignal<Record<string, boolean>>({});

  const slotsByDate = groupSlotsByDate(slots);

  if (collapsible) {
    const initialState: Record<string, boolean> = {};
    const dates = Object.keys(slotsByDate);
    if (dates.length > 0) {
      initialState[dates[0]] = true;
    }
    expandedDates.value = initialState;
  }

  // Toggle a date's expanded state
  function toggleDate(date: string) {
    if (collapsible) {
      expandedDates.value = {
        ...expandedDates.value,
        [date]: !expandedDates.value[date],
      };
    }
  }

  if (slots.length === 0) {
    return (
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
        <p>No available slots found.</p>
      </div>
    );
  }

  return (
    <div>
      {Object.entries(slotsByDate).map(([date, dateSlots]) => (
        <div key={date} class="mb-6">
          <h3
            class={`text-lg font-semibold flex items-center justify-between text-gray-800 bg-gray-100 px-4 py-2 rounded-t-lg ${
              collapsible ? "cursor-pointer" : ""
            }`}
            onClick={() => toggleDate(date)}
          >
            <div class="flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-indigo-600" />
              {formatDate(date)}
              <span className="ml-2 text-sm text-gray-500">
                ({dateSlots.length} slot{dateSlots.length !== 1 ? "s" : ""})
              </span>
            </div>

            {collapsible && (
              <button type="button" class="text-gray-500 hover:text-gray-700">
                {expandedDates.value[date] ? (
                  <ChevronUpIcon class="w-5 h-5" />
                ) : (
                  <ChevronDownIcon class="w-5 h-5" />
                )}
              </button>
            )}
          </h3>

          {(!collapsible || expandedDates.value[date]) && (
            <div class="space-y-2 border border-gray-200 rounded-b-lg p-4 bg-white">
              {dateSlots.map((slot) => (
                <div
                  key={slot.id}
                  class={`
                    border rounded-lg p-4 transition-all flex justify-between items-center
                    ${
                      slot.is_booked
                        ? "bg-gray-50 border-gray-200"
                        : "bg-white border-gray-200 hover:border-indigo-200 hover:shadow-sm"
                    }
                  `}
                >
                  <div>
                    <div class="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-2 text-indigo-500" />
                      <p className="font-medium text-gray-800">
                        {formatTime(slot.start_time)} -{" "}
                        {formatTime(slot.end_time)}
                      </p>
                    </div>

                    <p className="text-sm text-gray-500 mt-1 ml-6">
                      {slot.duration} minutes
                    </p>

                    {isAdmin && (
                      <span
                        class={`
                          inline-block text-xs px-2 py-1 rounded-full font-medium mt-2 ml-6
                          ${
                            slot.is_booked
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }
                        `}
                      >
                        {slot.is_booked ? "Booked" : "Available"}
                      </span>
                    )}
                  </div>

                  {onSelect && !slot.is_booked && (
                    <button
                      type="button"
                      onClick={() => onSelect(slot)}
                      class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Book this time
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
