import { AvailabilitySlot } from "../utils/supabase.ts";

export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(timeStr: string) {
  // Convert 24-hour format to 12-hour format with AM/PM
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function formatSlot(slot: AvailabilitySlot) {
  const formattedDate = formatDate(slot.date);
  const formattedStartTime = formatTime(slot.start_time);
  const formattedEndTime = formatTime(slot.end_time);

  return `${formattedDate} from ${formattedStartTime} to ${formattedEndTime}`;
}

// Note: No component here, it's moved to islands/availability/SlotList.tsx
