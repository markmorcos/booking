import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";

interface DashboardStats {
  pending_count: number;
  confirmed_count: number;
  cancelled_count: number;
  available_slots: number;
  total_slots: number;
}

interface TodayAppointment {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "pending" | "confirmed" | "cancelled";
  start_time: string;
  end_time: string;
}

const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<
    TodayAppointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/admin/dashboard.json", {
          headers: {
            Accept: "application/json",
            "X-CSRF-Token":
              document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || "",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setStats({
          pending_count: data.stats.pending_count,
          confirmed_count: data.stats.confirmed_count,
          cancelled_count: data.stats.cancelled_count,
          available_slots: data.stats.available_slots,
          total_slots: data.stats.total_slots,
        });
        setTodayAppointments(data.today_appointments);
      } catch (err) {
        setError("Failed to load dashboard data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading-indicator">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Dashboard</h1>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Pending Appointments</h3>
            <div className="stat-value">{stats.pending_count}</div>
          </div>
          <div className="stat-card">
            <h3>Confirmed Appointments</h3>
            <div className="stat-value">{stats.confirmed_count}</div>
          </div>
          <div className="stat-card">
            <h3>Cancelled Appointments</h3>
            <div className="stat-value">{stats.cancelled_count}</div>
          </div>
          <div className="stat-card">
            <h3>Available Slots</h3>
            <div className="stat-value">
              {stats.available_slots} / {stats.total_slots}
            </div>
          </div>
        </div>
      )}

      <section className="admin-card mt-8">
        <h2 className="admin-section-title">Today's Appointments</h2>

        {todayAppointments.length === 0 ? (
          <div className="admin-empty-state">
            No appointments scheduled for today.
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {todayAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>
                      {format(parseISO(appointment.start_time), "h:mm a")}
                    </td>
                    <td>{appointment.name}</td>
                    <td>
                      <div>{appointment.email}</div>
                      <div>{appointment.phone}</div>
                    </td>
                    <td>
                      <span
                        className={`status-badge status-${appointment.status}`}
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
        )}
      </section>
    </div>
  );
};

export default DashboardOverview;
