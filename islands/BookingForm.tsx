import { useState } from "preact/hooks";
import { AvailabilitySlot } from "../utils/supabase.ts";
import { Button } from "../components/Button.tsx";
import { formatSlot } from "../components/SlotList.tsx";
import { UserIcon, EmailIcon, CalendarIcon } from "../components/Icons.tsx";

interface BookingFormProps {
  slot: AvailabilitySlot;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function BookingForm({
  slot,
  onCancel,
  onSuccess,
}: BookingFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slot_id: slot.id,
          name,
          email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to book appointment");
      }

      onSuccess();
    } catch (err) {
      console.error("Booking error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Book Appointment</h2>

      <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-6 rounded">
        <div className="flex items-center">
          <CalendarIcon className="w-5 h-5 text-indigo-500 mr-2" />
          <p className="text-indigo-700 font-medium">{formatSlot(slot)}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            <div className="flex items-center">
              <UserIcon className="w-4 h-4 mr-2" />
              <span>Your Name</span>
            </div>
          </label>
          <input
            id="name"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-300"
            value={name}
            onChange={(e: Event) =>
              setName((e.target as HTMLInputElement).value)
            }
            required
            placeholder="John Doe"
          />
        </div>

        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            <div className="flex items-center">
              <EmailIcon className="w-4 h-4 mr-2" />
              <span>Email Address</span>
            </div>
          </label>
          <input
            id="email"
            type="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-300"
            value={email}
            onChange={(e: Event) =>
              setEmail((e.target as HTMLInputElement).value)
            }
            required
            placeholder="john@example.com"
          />
        </div>

        <div className="flex justify-between mt-6">
          <Button
            type="button"
            onClick={onCancel}
            class="bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            class="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? "Booking..." : "Book Appointment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
