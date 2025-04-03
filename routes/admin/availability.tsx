import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getAllSlots, AvailabilitySlot } from "../../utils/supabase.ts";
import SlotList from "../../islands/SlotList.tsx";
import CreateSlotForm from "../../islands/CreateSlotForm.tsx";
import AdminHeader from "../../islands/AdminHeader.tsx";

export const handler: Handlers<{ slots: AvailabilitySlot[] }> = {
  async GET(_req, ctx) {
    try {
      const slots = await getAllSlots();
      return ctx.render({ slots });
    } catch (error) {
      console.error("Error fetching slots:", error);
      return ctx.render({ slots: [] });
    }
  },
};

export default function AvailabilityManagement({
  data,
}: PageProps<{ slots: AvailabilitySlot[] }>) {
  return (
    <>
      <Head>
        <title>Manage Availability - Appointment Booking</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-lg">
        <AdminHeader />

        <div class="mb-8">
          <h2 class="text-xl font-semibold mb-4">
            Create New Availability Slot
          </h2>
          <CreateSlotForm />
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-4">All Availability Slots</h2>
          <SlotList slots={data.slots} isAdmin />
        </div>
      </div>
    </>
  );
}
