const feedbackList = document.getElementById("feedbackList");
const paginationControls = document.getElementById("paginationControls");
const feedbackForm = document.getElementById("feedbackForm");


function fetchFeedbacks(page = 1, limit = 5) {
  fetch(`http://127.0.0.1:5000/feedbacks?page=${page}&limit=${limit}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      feedbackList.innerHTML = "";
      paginationControls.innerHTML = "";

      if (data.feedbacks.length === 0) {
        feedbackList.innerHTML = "<p>No feedback available.</p>";
        return;
      }


      data.feedbacks.forEach((feedback) => {
        const li = document.createElement("li");
        const feedbackLink = document.createElement("a");


        const formattedDate = new Date(feedback.created_at).toLocaleString();
        feedbackLink.href = `view-feedback.html?id=${feedback.id}`;
        feedbackLink.textContent = `${feedback.name} (${formattedDate})`;
        li.appendChild(feedbackLink);
        feedbackList.appendChild(li);
      });


      if (data.total_pages > 1) {
        for (let i = 1; i <= data.total_pages; i++) {
          const button = document.createElement("button");
          button.textContent = i;
          button.onclick = () => fetchFeedbacks(i, limit);
          paginationControls.appendChild(button);
        }
      }
    })
    .catch((err) => alert("Error fetching feedbacks: " + err));
}


function handleFeedbackSubmission(event) {
  event.preventDefault();

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
        throw new Error("Failed to submit feedback");
      }
      return response.json();
    })
    .then(() => {
      alert("Feedback submitted successfully!");
      feedbackForm.reset();
      fetchFeedbacks();
    })
    .catch((err) => alert("Error submitting feedback: " + err));
}


document.addEventListener("DOMContentLoaded", () => {
  feedbackForm.addEventListener("submit", handleFeedbackSubmission);
  fetchFeedbacks();
});
