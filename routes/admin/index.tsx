import { Handlers, PageProps } from "$fresh/server.ts";
import { useSignal } from "@preact/signals";
import { AvailabilityService } from "../../domains/availability/service.ts";
import { AppointmentService } from "../../domains/appointments/service.ts";
import { isAuthenticated } from "../../utils/supabase.ts";
import AdminLayout from "../../components/AdminLayout.tsx";
import CreateSlotForm from "../../islands/CreateSlotForm.tsx";
import SlotList from "../../islands/SlotList.tsx";
import AppointmentList from "../../islands/AppointmentList.tsx";

export const handler: Handlers = {
  async GET(req, ctx) {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      const url = new URL(req.url);
      return Response.redirect(
        `${url.origin}/login?redirectTo=${url.pathname}`
      );
    }

    // Use domain services to get data
    const availabilityService = new AvailabilityService();
    const appointmentService = new AppointmentService();

    const slots = await availabilityService.getAllSlots();
    const appointments = await appointmentService.getAllAppointments();

    return ctx.render({ slots, appointments });
  },
};

export default function AdminDashboard({ data }: PageProps) {
  const { slots: initialSlots, appointments } = data;
  const slots = useSignal(initialSlots);

  // Function to refresh slots
  const refreshSlots = async () => {
    try {
      const availabilityService = new AvailabilityService();
      const updatedSlots = await availabilityService.getAllSlots();
      slots.value = updatedSlots;
    } catch (error) {
      console.error("Error refreshing slots:", error);
    }
  };

  return (
    <AdminLayout title="Create New Availability Slot">
      <div class="space-y-8">
        <CreateSlotForm onSlotsCreated={refreshSlots} />

        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            All Availability Slots
          </h2>
          {slots.value.length === 0 ? (
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
              <p>No available slots found.</p>
            </div>
          ) : (
            <SlotList slots={slots.value} isAdmin collapsible />
          )}
        </div>

        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            Appointment Requests
          </h2>
          <AppointmentList appointments={appointments} />
        </div>
      </div>
    </AdminLayout>
  );
}
