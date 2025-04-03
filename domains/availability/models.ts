export interface AvailabilitySlot {
  id?: number;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  is_booked: boolean;
}

export type SlotCreationRequest = {
  startDate: string;
  endDate?: string;
  startTime: string;
  endTime?: string;
  slotDuration: number;
};

export type SlotsByDate = Record<string, AvailabilitySlot[]>;
