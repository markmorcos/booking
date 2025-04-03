import { AppointmentRepository } from "./repository.ts";
import {
  AppointmentRequest,
  AppointmentWithSlot,
  AppointmentUpdateRequest,
} from "./models.ts";
import { AvailabilityService } from "../availability/service.ts";

export class AppointmentService {
  private repository: AppointmentRepository;
  private availabilityService: AvailabilityService;

  constructor(
    repository?: AppointmentRepository,
    availabilityService?: AvailabilityService
  ) {
    this.repository = repository || new AppointmentRepository();
    this.availabilityService = availabilityService || new AvailabilityService();
  }

  async getAllAppointments(): Promise<AppointmentWithSlot[]> {
    return await this.repository.findAll();
  }

  async createAppointment(
    appointment: AppointmentRequest
  ): Promise<AppointmentRequest> {
    // Create the appointment
    const result = await this.repository.create(appointment);

    // Mark the slot as booked
    await this.availabilityService.markSlotAsBooked(appointment.slot_id);

    return result;
  }

  async updateAppointmentStatus(
    request: AppointmentUpdateRequest
  ): Promise<void> {
    await this.repository.updateStatus(request.id, request.status);
  }
}
