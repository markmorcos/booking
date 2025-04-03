import { AvailabilityRepository } from "./repository.ts";
import {
  AvailabilitySlot,
  SlotCreationRequest,
  SlotsByDate,
} from "./models.ts";

export class AvailabilityService {
  private repository: AvailabilityRepository;

  constructor(repository?: AvailabilityRepository) {
    this.repository = repository || new AvailabilityRepository();
  }

  getAllSlots(): Promise<AvailabilitySlot[]> {
    return this.repository.findAll();
  }

  getAvailableSlots(): Promise<AvailabilitySlot[]> {
    return this.repository.findAvailable();
  }

  createSlots(request: SlotCreationRequest): Promise<AvailabilitySlot[]> {
    const slots = this.generateSlots(request);
    return this.repository.create(slots);
  }

  groupSlotsByDate(slots: AvailabilitySlot[]): SlotsByDate {
    return slots.reduce((acc, slot) => {
      const date = slot.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(slot);
      return acc;
    }, {} as SlotsByDate);
  }

  markSlotAsBooked(slotId: number): Promise<AvailabilitySlot> {
    return this.repository.update(slotId, { is_booked: true });
  }

  private generateSlots(request: SlotCreationRequest): AvailabilitySlot[] {
    const slots: AvailabilitySlot[] = [];

    if (request.endDate) {
      // Generate slots for multiple days
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);

      // Get all dates between start and end
      const dates = this.getDatesInRange(startDate, endDate);

      // For each date, generate slots
      dates.forEach((date) => {
        const dateString = date.toISOString().split("T")[0];
        const daySlots = this.calculateDaySlots(
          dateString,
          request.startTime,
          request.endTime || "17:00",
          request.slotDuration
        );
        slots.push(...daySlots);
      });
    } else {
      // Generate slots for a single day
      const daySlots = this.calculateDaySlots(
        request.startDate,
        request.startTime,
        request.endTime || "17:00",
        request.slotDuration
      );
      slots.push(...daySlots);
    }

    return slots;
  }

  private calculateDaySlots(
    dayDate: string,
    dayStartTime: string,
    dayEndTime: string,
    duration: number
  ): AvailabilitySlot[] {
    const slots: AvailabilitySlot[] = [];
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

  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
  }

  private getDatesInRange(startDate: Date, endDate: Date): Date[] {
    const dates = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }
}
