import { useState } from "preact/hooks";
import { AvailabilitySlot } from "../utils/supabase.ts";
import SlotList from "./SlotList.tsx";
import BookingForm from "./BookingForm.tsx";

interface AppointmentBookingProps {
  slots: AvailabilitySlot[];
}

export default function AppointmentBooking({ slots }: AppointmentBookingProps) {
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null
  );
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (bookingSuccess) {
    return (
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <p class="font-bold">Success!</p>
        <p>
          Your appointment request has been submitted. We'll be in touch soon.
        </p>
        <button
          type="button"
          class="mt-4 text-blue-600 hover:underline"
          onClick={() => setBookingSuccess(false)}
        >
          Book another appointment
        </button>
      </div>
    );
  }

  if (selectedSlot) {
    return (
      <BookingForm
        slot={selectedSlot}
        onCancel={() => setSelectedSlot(null)}
        onSuccess={() => {
          setSelectedSlot(null);
          setBookingSuccess(true);
        }}
      />
    );
  }

  return (
    <div>
      <h2 class="text-xl font-semibold mb-4">Available Slots</h2>
      <SlotList slots={slots} onSelect={setSelectedSlot} />
    </div>
  );
}
