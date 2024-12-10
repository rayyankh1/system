
function fetchTables() {
  const tableList = document.getElementById("tableList");

  fetch("http://127.0.0.1:5000/tables", { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      tableList.innerHTML = "";
      data.forEach((table) => {
        const li = document.createElement("li");
        li.textContent = `Table ${table.id} - Capacity: ${table.capacity}`;
        tableList.appendChild(li);
      });
    })
    .catch((err) => alert("Error fetching tables: " + err));
}


function handleCreateTable(event) {
  event.preventDefault();

  const capacity = parseInt(document.getElementById("capacity").value, 10);

  fetch("http://127.0.0.1:5000/tables", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ capacity }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to create table");
      }
      return response.json();
    })
    .then(() => {
      alert("Table created successfully!");
      fetchTables();
    })
    .catch((err) => alert("Error creating table: " + err));
}


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("createTableForm");
  form.addEventListener("submit", handleCreateTable);

  fetchTables();
});
