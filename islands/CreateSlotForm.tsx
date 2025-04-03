import { useState, useEffect } from "preact/hooks";
import { AvailabilitySlot } from "../utils/supabase.ts";

// Add an onSlotsCreated prop
interface CreateSlotFormProps {
  onSlotsCreated?: () => void;
}

export default function CreateSlotForm({
  onSlotsCreated,
}: CreateSlotFormProps) {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [slotDuration, setSlotDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdSlotsCount, setCreatedSlotsCount] = useState(0);
  const [preview, setPreview] = useState<{
    count: number;
    firstSlot: string;
    lastSlot: string;
  } | null>(null);

  // Calculate time slots for a single day
  const calculateDaySlots = (
    dayDate: string,
    dayStartTime: string,
    dayEndTime: string,
    duration: number
  ) => {
    const slots = [];
    const [startHours, startMinutes] = dayStartTime.split(":").map(Number);
    const [endHours, endMinutes] = dayEndTime.split(":").map(Number);

    let startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    while (startTotalMinutes + duration <= endTotalMinutes) {
      const slotStartHours = Math.floor(startTotalMinutes / 60);
      const slotStartMinutes = startTotalMinutes % 60;
      const slotStartTime = `${slotStartHours
        .toString()
        .padStart(2, "0")}:${slotStartMinutes.toString().padStart(2, "0")}`;

      const slotEndTotalMinutes = startTotalMinutes + duration;
      const slotEndHours = Math.floor(slotEndTotalMinutes / 60);
      const slotEndMinutes = slotEndTotalMinutes % 60;
      const slotEndTime = `${slotEndHours
        .toString()
        .padStart(2, "0")}:${slotEndMinutes.toString().padStart(2, "0")}`;

      slots.push({
        date: dayDate,
        start_time: slotStartTime,
        end_time: slotEndTime,
        duration,
        is_booked: false,
      });

      startTotalMinutes += duration;
    }

    return slots;
  };

  // Get all dates between start and end date
  const getDatesInRange = (startDate: Date, endDate: Date) => {
    const dates = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  // Generate a preview of the slots to be created
  const generatePreview = () => {
    try {
      const slots = generateAllSlots();
      if (slots.length === 0) return null;

      return {
        count: slots.length,
        firstSlot: `${formatDatePreview(slots[0].date)} ${
          slots[0].start_time
        }-${slots[0].end_time}`,
        lastSlot: `${formatDatePreview(slots[slots.length - 1].date)} ${
          slots[slots.length - 1].start_time
        }-${slots[slots.length - 1].end_time}`,
      };
    } catch (error) {
      console.error("Error generating preview:", error);
      return null;
    }
  };

  const formatDatePreview = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Generate all slots based on form inputs
  const generateAllSlots = () => {
    let allSlots: Omit<AvailabilitySlot, "id">[] = [];

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        throw new Error("End date must be after start date");
      }

      const dateArray = getDatesInRange(start, end);

      for (const date of dateArray) {
        const formattedDate = date.toISOString().split("T")[0];

        // Create multiple slots throughout the day
        const daySlots = calculateDaySlots(
          formattedDate,
          startTime,
          endTime,
          slotDuration
        );
        allSlots = [...allSlots, ...daySlots];
      }
    } else if (startDate) {
      // Single day mode
      // Create multiple slots throughout the day
      const daySlots = calculateDaySlots(
        startDate,
        startTime,
        endTime,
        slotDuration
      );
      allSlots = daySlots;
    }

    return allSlots;
  };

  // Handle form submission
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setCreatedSlotsCount(0);

    try {
      // Generate all slots based on form inputs
      const allSlots = generateAllSlots();

      if (allSlots.length === 0) {
        throw new Error("No valid slots to create");
      }

      if (allSlots.length > 100) {
        throw new Error("Cannot create more than 100 slots at once");
      }

      // Create slots in batch
      const response = await fetch("/api/admin/slots/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slots: allSlots,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create slots");
      }

      const result = await response.json();
      setCreatedSlotsCount(result.data.length);
      setSuccess(true);

      // Notify parent component about successful slot creation
      if (onSlotsCreated) {
        onSlotsCreated();
      }

      // Reset form
      setStartDate("");
      setPreview(null);
    } catch (err) {
      console.error("Error creating slots:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // Add this useEffect to update the preview when any relevant state changes
  useEffect(() => {
    try {
      const newPreview = generatePreview();
      setPreview(newPreview);
    } catch (error) {
      console.error("Error generating preview:", error);
      setPreview(null);
    }
  }, [startDate, endDate, startTime, endTime, endTime, slotDuration]);

  // Remove the preview generation from handleInputChange
  const handleInputChange = () => {
    // Clear any previous error
    setError("");
    setSuccess(false);
  };

  return (
    <div className="bg-white rounded-lg">
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-md p-4">
          Successfully created {createdSlotsCount} slot
          {createdSlotsCount !== 1 ? "s" : ""}!
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className={`grid grid-cols-2 gap-4`}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={startDate}
                onChange={(e) => {
                  setStartDate((e.target as HTMLInputElement).value);
                  handleInputChange();
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={endDate}
                onChange={(e) => {
                  setEndDate((e.target as HTMLInputElement).value);
                  handleInputChange();
                }}
                required
                min={startDate}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={startTime}
                onChange={(e) => {
                  setStartTime((e.target as HTMLInputElement).value);
                  handleInputChange();
                }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Day Time
              </label>
              <input
                type="time"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={endTime}
                onChange={(e) => {
                  setEndTime((e.target as HTMLInputElement).value);
                  handleInputChange();
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slot Duration (minutes)
              </label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={slotDuration}
                onChange={(e) => {
                  setSlotDuration(
                    parseInt((e.target as HTMLSelectElement).value)
                  );
                  handleInputChange();
                }}
                required
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </select>
            </div>
          </div>

          {preview && preview.count > 0 && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mt-4">
              <h3 className="text-indigo-800 font-semibold mb-2">Preview</h3>
              <p className="text-indigo-700">
                This will create{" "}
                <span className="font-bold">{preview.count}</span> slot
                {preview.count !== 1 ? "s" : ""}
              </p>
              <p className="text-indigo-700 text-sm mt-1">
                From: <span className="font-semibold">{preview.firstSlot}</span>
              </p>
              <p className="text-indigo-700 text-sm">
                To: <span className="font-semibold">{preview.lastSlot}</span>
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : "Create Slot" + (preview && preview.count > 1 ? "s" : "")}
          </button>
        </div>
      </form>
    </div>
  );
}
