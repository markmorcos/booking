import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["day"];

  connect() {
    // If there's a date parameter in the URL, select that date
    const urlParams = new URLSearchParams(window.location.search);
    const selectedDate = urlParams.get("date");
    if (selectedDate) {
      this.dayTargets.forEach((day) => {
        if (day.href.includes(`date=${selectedDate}`)) {
          day.classList.add("is-selected");
        }
      });
    }
  }

  select(event) {
    // Remove selected class from all days
    this.dayTargets.forEach((day) => day.classList.remove("is-selected"));

    // Add selected class to clicked day
    event.currentTarget.classList.add("is-selected");
  }
}
