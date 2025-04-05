import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { AdminUser } from "../../types";

const AdminUserList: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states for creating new user
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserPasswordConfirmation, setNewUserPasswordConfirmation] =
    useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch("/admin/users.json", {
        headers: {
          Accept: "application/json",
          "X-CSRF-Token":
            document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content") || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch admin users");
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError("Failed to load admin users. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-Token":
            document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content") || "",
        },
        body: JSON.stringify({
          admin_user: {
            name: newUserName,
            email: newUserEmail,
            password: newUserPassword,
            password_confirmation: newUserPasswordConfirmation,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setFormErrors(errorData.errors || {});
        return;
      }

      // Refresh users list
      await fetchUsers();
      setShowCreateModal(false);

      // Reset form
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserPasswordConfirmation("");
      setFormErrors({});
    } catch (err) {
      setError("Failed to create admin user. Please try again.");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this admin user?")) {
      return;
    }

    try {
      const response = await fetch(`/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "X-CSRF-Token":
            document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content") || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete admin user");
      }

      // Refresh users list
      await fetchUsers();
    } catch (err) {
      setError("Failed to delete admin user. Please try again.");
    }
  };

  if (loading && users.length === 0) {
    return <div className="loading-indicator">Loading admin users...</div>;
  }

  return (
    <div className="admin-users">
      <div className="flex justify-between items-center mb-6">
        <h1>Admin Users</h1>
        <button
          className="admin-button admin-button-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Add New Admin
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-card">
        {users.length === 0 ? (
          <div className="admin-empty-state">No admin users found.</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Last Sign In</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.last_sign_in_at
                        ? format(
                            parseISO(user.last_sign_in_at),
                            "MMM d, yyyy h:mm a"
                          )
                        : "Never"}
                    </td>
                    <td>{format(parseISO(user.created_at), "MMM d, yyyy")}</td>
                    <td>
                      <div className="flex space-x-2">
                        <a
                          href={`/admin/users/${user.id}/edit`}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </a>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Create New Admin User</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label className="form-label">Name:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    required
                  />
                  {formErrors.name && (
                    <div className="form-error">
                      {formErrors.name.join(", ")}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Email:</label>
                  <input
                    type="email"
                    className="form-input"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                  />
                  {formErrors.email && (
                    <div className="form-error">
                      {formErrors.email.join(", ")}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Password:</label>
                  <input
                    type="password"
                    className="form-input"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                  />
                  {formErrors.password && (
                    <div className="form-error">
                      {formErrors.password.join(", ")}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password:</label>
                  <input
                    type="password"
                    className="form-input"
                    value={newUserPasswordConfirmation}
                    onChange={(e) =>
                      setNewUserPasswordConfirmation(e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="admin-button admin-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-button admin-button-primary"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserList;
