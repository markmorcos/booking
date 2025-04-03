export interface AppointmentRequest {
  id?: number;
  slot_id: number;
  name: string;
  email: string;
  status: "pending" | "confirmed" | "rejected";
  created_at?: string;
}

export type AppointmentWithSlot = AppointmentRequest & {
  availability_slots?: AvailabilitySlot;
};

export type AppointmentUpdateRequest = {
  id: number;
  status: "confirmed" | "rejected";
};
