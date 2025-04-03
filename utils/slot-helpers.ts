import { AvailabilitySlot } from "./supabase.ts";

// Calculate time slots for a single day
export function calculateDaySlots(
  dayDate: string,
  dayStartTime: string,
  dayEndTime: string,
  duration: number
): Omit<AvailabilitySlot, "id">[] {
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
}

// Get all dates between start and end date
export function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

// Calculate end time based on start time and duration
export function calculateEndTimeFromDuration(
  startTimeStr: string,
  durationMinutes: number
): string {
  if (!startTimeStr) return "";

  const [hours, minutes] = startTimeStr.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;

  return `${endHours.toString().padStart(2, "0")}:${endMinutes
    .toString()
    .padStart(2, "0")}`;
}

// Validate time slots
export function validateTimeSlot(
  date: string,
  startTime: string,
  endTime: string
): boolean {
  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  // Validate time format
  if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
    return false;
  }

  // Validate time range
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  if (
    startHours < 0 ||
    startHours > 23 ||
    startMinutes < 0 ||
    startMinutes > 59
  ) {
    return false;
  }

  if (endHours < 0 || endHours > 23 || endMinutes < 0 || endMinutes > 59) {
    return false;
  }

  // Ensure end time is after start time (unless crossing midnight)
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  if (endTotalMinutes <= startTotalMinutes && endTotalMinutes !== 0) {
    return false;
  }

  return true;
}
