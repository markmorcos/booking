import React from "react";
import { createRoot } from "react-dom/client";
import "../styles/admin.css";
import AdminApp from "../components/admin/AdminApp";

// Mount the React app to the DOM
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("admin-app");
  if (container) {
    const root = createRoot(container);
    root.render(<AdminApp />);
  }
});
