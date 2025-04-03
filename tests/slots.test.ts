import { assertEquals } from "$std/testing/asserts.ts";
import {
  calculateDaySlots,
  getDatesInRange,
  calculateEndTimeFromDuration,
} from "../utils/slot-helpers.ts";

Deno.test("calculateDaySlots generates correct number of slots", () => {
  // Test with 2-hour window, 30-minute slots
  const slots = calculateDaySlots("2025-04-03", "09:00", "11:00", 30);
  assertEquals(
    slots.length,
    4,
    "Should create 4 slots for a 2-hour period with 30-minute duration"
  );

  // Verify first and last slot
  assertEquals(slots[0].start_time, "09:00");
  assertEquals(slots[0].end_time, "09:30");
  assertEquals(slots[3].start_time, "10:30");
  assertEquals(slots[3].end_time, "11:00");

  // Test with odd end time
  const slots2 = calculateDaySlots("2025-04-03", "09:00", "10:45", 30);
  assertEquals(
    slots2.length,
    3,
    "Should create 3 slots and ignore incomplete slot"
  );
});

Deno.test("getDatesInRange returns all dates in range", () => {
  const startDate = new Date("2025-04-03");
  const endDate = new Date("2025-04-06");
  const dates = getDatesInRange(startDate, endDate);

  assertEquals(dates.length, 4, "Should include both start and end dates");
  assertEquals(dates[0].toISOString().split("T")[0], "2025-04-03");
  assertEquals(dates[3].toISOString().split("T")[0], "2025-04-06");
});

Deno.test("calculateEndTimeFromDuration correctly calculates end time", () => {
  // Test standard case
  assertEquals(
    calculateEndTimeFromDuration("09:00", 30),
    "09:30",
    "30 minutes after 9:00 should be 9:30"
  );

  // Test crossing hour boundary
  assertEquals(
    calculateEndTimeFromDuration("09:45", 30),
    "10:15",
    "30 minutes after 9:45 should be 10:15"
  );

  // Test crossing day boundary
  assertEquals(
    calculateEndTimeFromDuration("23:30", 60),
    "00:30",
    "60 minutes after 23:30 should be 00:30"
  );
});
