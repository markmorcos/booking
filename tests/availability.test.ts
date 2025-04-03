import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.224.0/testing/asserts.ts";

import { AvailabilityService } from "../domains/availability/service.ts";
import { AvailabilityRepository } from "../domains/availability/repository.ts";
import { AvailabilitySlot } from "../domains/availability/models.ts";

// Mocking the repository
class MockAvailabilityRepository extends AvailabilityRepository {
  private slots: AvailabilitySlot[] = [];

  override findAll(): Promise<AvailabilitySlot[]> {
    return Promise.resolve(this.slots);
  }

  override findAvailable(): Promise<AvailabilitySlot[]> {
    return Promise.resolve(this.slots.filter((slot) => !slot.is_booked));
  }

  override create(slots: AvailabilitySlot[]): Promise<AvailabilitySlot[]> {
    const slotsWithIds = slots.map((slot, index) => ({
      ...slot,
      id: this.slots.length + index + 1,
    }));
    this.slots.push(...slotsWithIds);
    return Promise.resolve(slotsWithIds);
  }

  override findById(id: number): Promise<AvailabilitySlot | null> {
    return Promise.resolve(this.slots.find((slot) => slot.id === id) || null);
  }

  override update(
    id: number,
    updates: Partial<AvailabilitySlot>
  ): Promise<AvailabilitySlot> {
    const index = this.slots.findIndex((slot) => slot.id === id);
    if (index !== -1) {
      this.slots[index] = { ...this.slots[index], ...updates };
    }
    return Promise.resolve(this.slots[index]);
  }
}

Deno.test("AvailabilityService - Create and get slots", async () => {
  const mockRepo = new MockAvailabilityRepository();
  const service = new AvailabilityService(mockRepo);

  // Create slots for today
  const today = new Date().toISOString().split("T")[0];
  const result = await service.createSlots({
    startDate: today,
    startTime: "09:00",
    endTime: "12:00",
    slotDuration: 60,
  });

  // Should create 3 slots (9-10, 10-11, 11-12)
  assertEquals(result.length, 3);

  // Get all slots
  const allSlots = await service.getAllSlots();
  assertEquals(allSlots.length, 3);

  // Check first slot
  const firstSlot = allSlots[0];
  assertExists(firstSlot.id);
  assertEquals(firstSlot.date, today);
  assertEquals(firstSlot.start_time, "09:00");
  assertEquals(firstSlot.end_time, "10:00");
  assertEquals(firstSlot.duration, 60);
  assertEquals(firstSlot.is_booked, false);
});
