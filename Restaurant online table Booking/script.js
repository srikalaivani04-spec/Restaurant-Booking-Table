const totalTables = 50;
let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

// DOM Elements
const bookingForm = document.getElementById("bookingForm");
const bookingsList = document.getElementById("bookings");
const totalTablesEl = document.getElementById("totalTables");
const reservedTablesEl = document.getElementById("reservedTables");
const availableTablesEl = document.getElementById("availableTables");
const tablesContainer = document.getElementById("tablesContainer");

// Helper: determine how many tables a booking actually reserved
function getTablesReservedForBooking(booking) {
  const guests = Number(booking.guests) || 0;
  const saved = Number(booking.tablesReserved);
  return Number.isFinite(saved) && saved > 0 ? saved : Math.ceil(guests / 4);
}

// Compute total reserved tables
function getReservedTables() {
  return bookings.reduce((sum, b) => sum + getTablesReservedForBooking(b), 0);
}

// Update table availability display
function updateAvailability() {
  const reservedTables = getReservedTables();
  reservedTablesEl.textContent = reservedTables;
  availableTablesEl.textContent = totalTables - reservedTables;
  totalTablesEl.textContent = totalTables;
  updateTableLayout();
}

// Render visual table grid
function updateTableLayout() {
  tablesContainer.innerHTML = "";
  let tableCounter = 0;

  bookings.forEach((booking) => {
    const tablesReserved = getTablesReservedForBooking(booking);
    for (let i = 0; i < tablesReserved; i++) {
      tableCounter++;
      const tableDiv = document.createElement("div");
      tableDiv.classList.add("table", "reserved");
      tableDiv.textContent = tableCounter;
      tablesContainer.appendChild(tableDiv);
    }
  });

  for (let i = tableCounter + 1; i <= totalTables; i++) {
    const tableDiv = document.createElement("div");
    tableDiv.classList.add("table", "available");
    tableDiv.textContent = i;
    tablesContainer.appendChild(tableDiv);
  }
}

// Save bookings to LocalStorage
function saveBookings() {
  localStorage.setItem("bookings", JSON.stringify(bookings));
}

// Render bookings list
function renderBookings() {
  if (!bookingsList) return;
  bookingsList.innerHTML = "";

  bookings.forEach((booking, index) => {
    const tablesReserved = getTablesReservedForBooking(booking);
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${booking.name} - ${booking.date} ${booking.time} (${booking.guests} guests) — Tables: ${tablesReserved}</span>
      <button class="cancel-btn" data-index="${index}">Cancel</button>
    `;
    bookingsList.appendChild(li);
  });

  // Add cancel event listeners
  document.querySelectorAll(".cancel-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index, 10);
      if (Number.isNaN(index)) return;
      bookings.splice(index, 1);
      saveBookings();
      renderBookings();
      updateAvailability();
    });
  });
}

//  Add this missing function
function loadBookings() {
  renderBookings();
  updateAvailability();
}

// Handle booking form submission
if (bookingForm) {
  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const guests = parseInt(document.getElementById("guests").value, 10) || 0;

    const tablesNeeded = Math.ceil(guests / 4) || 1;

    if (getReservedTables() + tablesNeeded > totalTables) {
      Swal.fire({
        icon: "error",
        title: "Sorry!",
        text: "Not enough tables available for your party size.",
        confirmButtonColor: "#e64a19"
      });
      return;
    }

    const newBooking = { name, email, date, time, guests, tablesReserved: tablesNeeded };
    bookings.push(newBooking);
    saveBookings();
    renderBookings();
    updateAvailability();
    bookingForm.reset();

    Swal.fire({
      icon: "success",
      title: "Table Booked!",
      text: `Your table has been successfully reserved for ${date} at ${time}.`,
      confirmButtonColor: "#ff7043"
    });
  });
}

//  Initialize everything once DOM is ready
document.addEventListener("DOMContentLoaded", loadBookings);
