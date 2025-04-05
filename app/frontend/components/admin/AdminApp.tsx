import React, { useState, useEffect } from "react";
import AdminNavigation from "./AdminNavigation";
import AppointmentList from "./AppointmentList";
import AvailabilitySlotList from "./AvailabilitySlotList";
import AdminUserList from "./AdminUserList";
import DashboardOverview from "./DashboardOverview";
import { AdminUser } from "../../types";

type AdminView = "dashboard" | "appointments" | "slots" | "users" | "settings";

const AdminApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Fetch current admin user data on component mount
  useEffect(() => {
    const userElement = document.getElementById("admin-data");
    if (userElement && userElement.dataset.user) {
      try {
        const userData = JSON.parse(userElement.dataset.user);
        setCurrentUser(userData);
      } catch (e) {
        console.error("Failed to parse admin user data", e);
      }
    }
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardOverview />;
      case "appointments":
        return <AppointmentList />;
      case "slots":
        return <AvailabilitySlotList />;
      case "users":
        return <AdminUserList />;
      default:
        return <DashboardOverview />;
    }
  };

  if (!currentUser) {
    return <div className="loading-indicator">Loading admin interface...</div>;
  }

  return (
    <div className="admin-layout">
      <AdminNavigation
        currentView={currentView}
        onViewChange={setCurrentView}
        currentUser={currentUser}
      />
      <div className="admin-content">{renderContent()}</div>
    </div>
  );
};

export default AdminApp;
