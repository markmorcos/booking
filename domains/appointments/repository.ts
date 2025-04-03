import * as supabase from "../../utils/supabase.ts";

import { AppointmentRequest, AppointmentWithSlot } from "./models.ts";

export class AppointmentRepository {
  findAll(): Promise<AppointmentWithSlot[]> {
    return supabase.getAppointmentRequests();
  }

  create(appointment: AppointmentRequest): Promise<AppointmentRequest> {
    return supabase.createAppointmentRequest(appointment);
  }

  updateStatus(id: number, status: "confirmed" | "rejected"): Promise<void> {
    return supabase.updateAppointmentStatus(id, status);
  }
}
