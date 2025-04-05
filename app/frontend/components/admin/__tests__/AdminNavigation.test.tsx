import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminNavigation from "../AdminNavigation";
import { AdminUser } from "../../../types";

describe("AdminNavigation", () => {
  const mockUser: AdminUser = {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    last_sign_in_at: "2023-01-01T00:00:00Z",
    sign_in_count: 10,
  };

  const mockOnViewChange = jest.fn();

  beforeEach(() => {
    mockOnViewChange.mockClear();
  });

  it("renders the navigation header with the correct title", () => {
    render(
      <AdminNavigation
        currentView="dashboard"
        onViewChange={mockOnViewChange}
        currentUser={mockUser}
      />
    );

    expect(screen.getByText("Fr. Youhanna Makin Admin")).toBeInTheDocument();
  });

  it("displays the current user name", () => {
    render(
      <AdminNavigation
        currentView="dashboard"
        onViewChange={mockOnViewChange}
        currentUser={mockUser}
      />
    );

    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  });

  it("shows the active class for the current view", () => {
    render(
      <AdminNavigation
        currentView="appointments"
        onViewChange={mockOnViewChange}
        currentUser={mockUser}
      />
    );

    const appointmentsButton = screen.getByText("Appointments");
    expect(appointmentsButton.className).toContain("active");

    const dashboardButton = screen.getByText("Dashboard");
    expect(dashboardButton.className).not.toContain("active");
  });

  it("calls onViewChange with the correct view when a navigation button is clicked", () => {
    render(
      <AdminNavigation
        currentView="dashboard"
        onViewChange={mockOnViewChange}
        currentUser={mockUser}
      />
    );

    const appointmentsButton = screen.getByText("Appointments");
    fireEvent.click(appointmentsButton);

    expect(mockOnViewChange).toHaveBeenCalledWith("appointments");
  });

  it("contains a logout link", () => {
    render(
      <AdminNavigation
        currentView="dashboard"
        onViewChange={mockOnViewChange}
        currentUser={mockUser}
      />
    );

    const logoutLink = screen.getByText("Logout");
    expect(logoutLink).toBeInTheDocument();
    expect(logoutLink.getAttribute("href")).toBe("/admin/sign_out");
    expect(logoutLink.getAttribute("data-method")).toBe("delete");
  });
});
