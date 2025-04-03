import { useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";

export default function AdminHeader() {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        globalThis.location.href = "/admin/login";
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to log out. Please try again.");
      setLoggingOut(false);
    }
  };

  return (
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Admin Dashboard</h1>
      <div class="flex space-x-2">
        <a
          href="/admin/availability"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Manage Availability
        </a>
        <Button
          onClick={handleLogout}
          disabled={loggingOut}
          class="bg-gray-500 hover:bg-gray-700"
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  );
}
