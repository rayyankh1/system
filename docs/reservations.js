
function populateTableDropdown() {
  console.log("populateTableDropdown triggered");

  const date = document.getElementById("date").value;
  const startTime = document.getElementById("start_time").value;
  const endTime = document.getElementById("end_time").value;


  fetch(
    `http://127.0.0.1:5000/tables/available?date=${date}&start_time=${startTime}&end_time=${endTime}`,
    { method: "GET" }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch available tables.");
      }
      return response.json();
    })
    .then((data) => {
      console.log("API response:", data); // Log data after fetching

      const tableDropdown = document.getElementById("table_id");
      tableDropdown.innerHTML = ""; // Clear existing options

      if (data.length === 0) {
        const option = document.createElement("option");
        option.textContent = "No tables available for the selected time slot.";
        option.disabled = true;
        option.selected = true;
        tableDropdown.appendChild(option);
        return;
      }


      data.forEach((table) => {
        const option = document.createElement("option");
        option.value = table.id;
        option.textContent = `Table ${table.id} (Capacity: ${table.capacity})`;
        tableDropdown.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Error fetching available tables:", error);
      alert("Could not load available tables. Please try again later.");
    });
}


function handleReservationSubmission(event) {
  event.preventDefault();

  const formData = {
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    date: document.getElementById("date").value,
    start_time: document.getElementById("start_time").value,
    end_time: document.getElementById("end_time").value,
    number_of_guests: parseInt(document.getElementById("guests").value, 10),
    table_id: parseInt(document.getElementById("table_id").value, 10),
  };


  if (
    !formData.name ||
    !formData.phone ||
    !formData.email ||
    !formData.date ||
    !formData.start_time ||
    !formData.end_time ||
    isNaN(formData.number_of_guests) ||
    isNaN(formData.table_id)
  ) {
    alert("All fields are required. Please complete the form.");
    return;
  }


  fetch("http://127.0.0.1:5000/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.error);
        });
      }
      return response.json();
    })
    .then(() => {
      alert("Reservation created successfully!");


      window.location.href = "feedbacks.html?success=true";
    })
    .catch((error) => {
      alert("Error creating reservation: " + error.message);
    });
}

document.addEventListener("DOMContentLoaded", function () {

  ["date", "start_time", "end_time"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", () => {
      const date = document.getElementById("date").value;
      const startTime = document.getElementById("start_time").value;
      const endTime = document.getElementById("end_time").value;


      if (date && startTime && endTime) {
        populateTableDropdown();
      }
    });
  });


  document
    .getElementById("reservationForm")
    ?.addEventListener("submit", handleReservationSubmission);
});
