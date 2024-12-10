document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;


    fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          loginMessage.textContent = data.error;
          loginMessage.style.color = "red";
        } else {
          loginMessage.textContent = "Login successful!";
          loginMessage.style.color = "green";


          setTimeout(() => {
            window.location.href = "adminPortal.html";
          }, 1000);
        }
      })
      .catch((error) => {
        console.error("Error logging in:", error);
        loginMessage.textContent = "An error occurred. Please try again.";
        loginMessage.style.color = "red";
      });
  });
});
