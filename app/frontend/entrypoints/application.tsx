import React from "react";
import { createRoot } from "react-dom/client";
import "../styles/application.css";
import BookingApp from "../components/BookingApp";

// Mount the React app to the DOM
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("booking-app");
  if (container) {
    const root = createRoot(container);
    root.render(<BookingApp />);
  }
});
