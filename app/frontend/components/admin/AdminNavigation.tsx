import React from "react";
import { AdminUser } from "../../types";

interface AdminNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  currentUser: AdminUser;
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({
  currentView,
  onViewChange,
  currentUser,
}) => {
  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <div className="admin-logo">Fr. Youhanna Makin Admin</div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-link ${
              currentView === "dashboard" ? "active" : ""
            }`}
            onClick={() => onViewChange("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={`admin-nav-link ${
              currentView === "appointments" ? "active" : ""
            }`}
            onClick={() => onViewChange("appointments")}
          >
            Appointments
          </button>

          <button
            className={`admin-nav-link ${
              currentView === "slots" ? "active" : ""
            }`}
            onClick={() => onViewChange("slots")}
          >
            Availability Slots
          </button>

          <button
            className={`admin-nav-link ${
              currentView === "users" ? "active" : ""
            }`}
            onClick={() => onViewChange("users")}
          >
            Admin Users
          </button>

          <div className="ml-6 flex items-center space-x-2">
            <span className="opacity-80">{currentUser.name}</span>
            <a
              href="/admin/sign_out"
              className="admin-nav-link"
              data-method="delete"
            >
              Logout
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default AdminNavigation;
