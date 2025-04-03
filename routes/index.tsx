import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getAvailableSlots, AvailabilitySlot } from "../utils/supabase.ts";
import AppointmentBooking from "../islands/AppointmentBooking.tsx";

export const handler: Handlers<{ slots: AvailabilitySlot[] }> = {
  async GET(_req, ctx) {
    try {
      const slots = await getAvailableSlots();
      return ctx.render({ slots });
    } catch (error) {
      console.error("Error fetching slots:", error);
      return ctx.render({ slots: [] });
    }
  },
};

export default function Home({
  data,
}: PageProps<{ slots: AvailabilitySlot[] }>) {
  return (
    <>
      <Head>
        <title>Fr Youhanna Makin</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <h1 class="text-3xl font-bold mb-6">Fr Youhanna Makin</h1>
        <h1 class="text-2xl font-bold mb-6">Book an Appointment</h1>
        <AppointmentBooking slots={data.slots} />
      </div>
    </>
  );
}
