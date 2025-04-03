import * as supabase from "../../utils/supabase.ts";
import { AvailabilitySlot } from "./models.ts";

export class AvailabilityRepository {
  findAll(): Promise<AvailabilitySlot[]> {
    return supabase.getAllSlots();
  }

  findAvailable(): Promise<AvailabilitySlot[]> {
    return supabase.getAvailableSlots();
  }

  create(slots: AvailabilitySlot[]): Promise<AvailabilitySlot[]> {
    return supabase.createSlotBatch(slots);
  }

  findById(id: number): Promise<AvailabilitySlot | null> {
    return supabase.getSlotById(id);
  }

  update(
    id: number,
    updates: Partial<AvailabilitySlot>
  ): Promise<AvailabilitySlot> {
    return supabase.updateSlot(id, updates);
  }
}
