import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";

interface Appointment {
  id: number;
  name: string;
  email: string;
  phone: string;
  notes: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  slot: {
    start_time: string;
    end_time: string;
  };
}

interface PaginationData {
  current_page: number;
  total_pages: number;
  total_count: number;
}

const AppointmentList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    fetchAppointments(1);
  }, [statusFilter, startDate, endDate]);

  const fetchAppointments = async (page: number) => {
    try {
      setLoading(true);

      let url = `/admin/appointments.json?page=${page}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "X-CSRF-Token":
            document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content") || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();
      setAppointments(data.appointments);
      setPagination({
        current_page: data.meta.current_page,
        total_pages: data.meta.total_pages,
        total_count: data.meta.total_count,
      });
    } catch (err) {
      setError("Failed to load appointments. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchAppointments(page);
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(e.target.value);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "confirmed":
        return "status-confirmed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const formatAppointmentTime = (startTime: string, endTime: string) => {
    const start = parseISO(startTime);
    const end = parseISO(endTime);

    return `${format(start, "MMM d, yyyy")} at ${format(
      start,
      "h:mm a"
    )} - ${format(end, "h:mm a")}`;
  };

  if (loading && appointments.length === 0) {
    return <div className="loading-indicator">Loading appointments...</div>;
  }

  return (
    <div className="admin-appointments">
      <h1>Appointments</h1>

      <div className="admin-filters">
        <div className="admin-filter-group">
          <label className="admin-filter-label">Status:</label>
          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="admin-filter-group">
          <label className="admin-filter-label">Start Date:</label>
          <input
            type="date"
            className="admin-filter-input"
            value={startDate}
            onChange={handleStartDateChange}
          />
        </div>

        <div className="admin-filter-group">
          <label className="admin-filter-label">End Date:</label>
          <input
            type="date"
            className="admin-filter-input"
            value={endDate}
            onChange={handleEndDateChange}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {appointments.length === 0 ? (
        <div className="admin-empty-state">
          No appointments found matching the criteria.
        </div>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Patient Name</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>
                      {formatAppointmentTime(
                        appointment.slot.start_time,
                        appointment.slot.end_time
                      )}
                    </td>
                    <td>{appointment.name}</td>
                    <td>
                      <div>{appointment.email}</div>
                      <div>{appointment.phone}</div>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          appointment.status
                        )}`}
                      >
                        {appointment.status.charAt(0).toUpperCase() +
                          appointment.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <a
                        href={`/admin/appointments/${appointment.id}`}
                        className="admin-button-secondary text-sm"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.total_pages > 1 && (
            <div className="admin-pagination">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="admin-button-secondary"
              >
                Previous
              </button>

              <span className="pagination-info">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.total_pages}
                className="admin-button-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-6">
        <a
          href="/admin/appointments/new"
          className="admin-button admin-button-primary"
        >
          Create New Appointment
        </a>
      </div>
    </div>
  );
};

export default AppointmentList;
