import { useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import { formatDate, formatTime } from "../components/SlotList.tsx";
import { AppointmentRequest, AvailabilitySlot } from "../utils/supabase.ts";
import {
  UserIcon,
  EmailIcon,
  CalendarIcon,
  ClockIcon,
} from "../components/Icons.tsx";

type AppointmentWithSlot = AppointmentRequest & {
  availability_slots: AvailabilitySlot;
};

interface AppointmentListProps {
  appointments: AppointmentWithSlot[];
}

export default function AppointmentList({
  appointments,
}: AppointmentListProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [appointments_state, setAppointments] =
    useState<AppointmentWithSlot[]>(appointments);

  const handleUpdateStatus = async (
    id: number,
    status: "confirmed" | "rejected"
  ) => {
    setUpdatingId(id);
    try {
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      // Update the appointment status in the state
      setAppointments(
        appointments_state.map((apt) =>
          apt.id === id ? { ...apt, status } : apt
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert(
        "Failed to update appointment status: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (appointments_state.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
        <p>No appointment requests found.</p>
      </div>
    );
  }

  // Group appointments by status
  const pendingAppointments = appointments_state.filter(
    (apt) => apt.status === "pending"
  );
  const confirmedAppointments = appointments_state.filter(
    (apt) => apt.status === "confirmed"
  );
  const rejectedAppointments = appointments_state.filter(
    (apt) => apt.status === "rejected"
  );

  return (
    <div className="space-y-8">
      {pendingAppointments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-amber-600">
            Pending Requests
          </h3>
          <div className="space-y-3">
            {pendingAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                updatingId={updatingId}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        </div>
      )}

      {confirmedAppointments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-green-600">
            Confirmed Appointments
          </h3>
          <div className="space-y-3">
            {confirmedAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                updatingId={updatingId}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        </div>
      )}

      {rejectedAppointments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-red-600">
            Rejected Requests
          </h3>
          <div className="space-y-3">
            {rejectedAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                updatingId={updatingId}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface AppointmentCardProps {
  appointment: AppointmentWithSlot;
  updatingId: number | null;
  onUpdateStatus: (id: number, status: "confirmed" | "rejected") => void;
}

function AppointmentCard({
  appointment: apt,
  updatingId,
  onUpdateStatus,
}: AppointmentCardProps) {
  const isPending = apt.status === "pending";
  const isConfirmed = apt.status === "confirmed";
  const isRejected = apt.status === "rejected";

  const statusColors = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    confirmed: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };

  const cardClass = `border rounded-lg p-5 transition-all ${
    statusColors[apt.status]
  }`;

  return (
    <div className={cardClass}>
      <div className="flex justify-between flex-wrap gap-4">
        <div className="space-y-3">
          <div>
            <div className="flex items-center">
              <UserIcon className="w-4 h-4 mr-2 text-gray-600" />
              <h3 className="font-medium text-gray-900">{apt.name}</h3>
            </div>
            <div className="flex items-center mt-1">
              <EmailIcon className="w-4 h-4 mr-2 text-gray-600" />
              <p className="text-sm text-gray-600">{apt.email}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center mb-1">
              <CalendarIcon className="w-4 h-4 mr-2 text-gray-600" />
              <p className="text-sm text-gray-700">
                {apt.availability_slots?.date
                  ? formatDate(apt.availability_slots.date)
                  : "Slot information unavailable"}
              </p>
            </div>
            <div className="flex items-center mt-1">
              <ClockIcon className="w-4 h-4 mr-2 text-gray-600" />
              <p className="text-sm text-gray-700">
                {apt.availability_slots?.start_time &&
                apt.availability_slots?.end_time
                  ? `${formatTime(
                      apt.availability_slots.start_time
                    )} - ${formatTime(apt.availability_slots.end_time)}`
                  : "Time information unavailable"}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            <span className="font-medium">Submitted:</span>{" "}
            {new Date(apt.created_at!).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-col space-y-2 justify-center">
          <span
            className={`
              inline-block px-3 py-1 rounded-full text-xs font-semibold self-end
              ${
                isPending
                  ? "bg-amber-200 text-amber-800"
                  : isConfirmed
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
              }
            `}
          >
            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
          </span>

          {isPending && (
            <div className="flex space-x-2 mt-3">
              <Button
                onClick={() => onUpdateStatus(apt.id!, "confirmed")}
                disabled={updatingId === apt.id}
                class="bg-green-600 hover:bg-green-700 text-sm px-3 py-1 h-8"
              >
                Confirm
              </Button>
              <Button
                onClick={() => onUpdateStatus(apt.id!, "rejected")}
                disabled={updatingId === apt.id}
                class="bg-red-600 hover:bg-red-700 text-sm px-3 py-1 h-8"
              >
                Reject
              </Button>
            </div>
          )}

          {isRejected && (
            <Button
              onClick={() => onUpdateStatus(apt.id!, "confirmed")}
              disabled={updatingId === apt.id}
              class="bg-green-600 hover:bg-green-700 text-sm px-3 py-1 h-8 mt-3"
            >
              Confirm Instead
            </Button>
          )}

          {isConfirmed && (
            <Button
              onClick={() => onUpdateStatus(apt.id!, "rejected")}
              disabled={updatingId === apt.id}
              class="bg-red-600 hover:bg-red-700 text-sm px-3 py-1 h-8 mt-3"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
