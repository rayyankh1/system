// Function to fetch and display all reservations
function fetchReservations() {
  fetch("http://127.0.0.1:5000/reservations", { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      const tbody = document.querySelector("#reservationsTable tbody");
      tbody.innerHTML = ""; // Clear any existing rows

      data.forEach((reservation) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
                    <td>${reservation.name}</td>
                    <td>${reservation.phone}</td>
                    <td>${reservation.email}</td>
                    <td>${new Date(reservation.date).toLocaleDateString()}</td>
                    <td>${reservation.time}</td>
                    <td>${reservation.guests}</td>
                    <td>${reservation.table_ref_id}</td>
                `;
        tbody.appendChild(tr);
      });
    })
    .catch((error) => {
      console.error("Error fetching reservations:", error);
      alert("Could not load reservations.");
    });
}

// Function to populate table dropdown with available tables
function populateTableDropdown() {
  fetch("http://127.0.0.1:5000/tables/available", { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      const tableDropdown = document.getElementById("table_id");
      tableDropdown.innerHTML = ""; // Clear existing options

      if (data.length === 0) {
        const option = document.createElement("option");
        option.textContent = "No tables available";
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
      alert("Could not load available tables.");
    });
}

// Function to fetch and display table availability
function fetchTableAvailability() {
  fetch("http://127.0.0.1:5000/tables/available", { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      const availabilityContainer = document.getElementById("availability");
      availabilityContainer.innerHTML = ""; // Clear any existing data

      if (data.length === 0) {
        availabilityContainer.textContent =
          "No tables are currently available.";
        return;
      }

      data.forEach((table) => {
        const div = document.createElement("div");
        div.textContent = `Table ${table.id} (Capacity: ${table.capacity}) is available.`;
        availabilityContainer.appendChild(div);
      });
    })
    .catch((error) => {
      console.error("Error fetching table availability:", error);
      alert("Could not load table availability.");
    });
}

// Function to fetch and display customer feedback
function fetchFeedbacks() {
  fetch("http://127.0.0.1:5000/feedbacks", { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      const feedbackList = document.getElementById("feedbackList");
      feedbackList.innerHTML = ""; // Clear existing feedback

      if (data.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No feedback available.";
        feedbackList.appendChild(li);
        return;
      }

      data.forEach((feedback) => {
        const li = document.createElement("li");
        li.textContent = `${feedback.name} (${feedback.email}): ${feedback.feedback}`;
        feedbackList.appendChild(li);
      });
    })
    .catch((error) => {
      console.error("Error fetching feedbacks:", error);
      alert("Could not load feedbacks.");
    });
}

// Function to handle reservation form submission
document
  .getElementById("reservationForm")
  ?.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    const formData = {
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      email: document.getElementById("email").value,
      date: document.getElementById("date").value,
      time: document.getElementById("time").value,
      guests: parseInt(document.getElementById("guests").value, 10),
      table_id: parseInt(document.getElementById("table_id").value, 10), // Include selected table ID
    };

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
      .then((data) => {
        // Redirect to Thank You page after successful reservation
        window.location.href = "thankyou.html";
      })
      .catch((error) => {
        alert("Error: " + error.message);
      });
  });

// Function to handle feedback form submission
document
  .getElementById("feedbackForm")
  ?.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    const feedbackData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      feedback: document.getElementById("feedback").value,
    };

    fetch("http://127.0.0.1:5000/feedbacks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedbackData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.error);
          });
        }
        return response.json();
      })
      .then((data) => {
        alert("Thank you for your feedback!");
        document.getElementById("feedbackForm").reset(); // Clear the form after submission
      })
      .catch((error) => {
        alert("Error: " + error.message);
      });
  });

// Load data on page load
document.addEventListener("DOMContentLoaded", function () {
  fetchReservations();
  fetchTableAvailability();
  fetchFeedbacks();
  populateTableDropdown();
});
