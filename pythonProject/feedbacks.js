const feedbackForm = document.getElementById("feedbackForm");


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
    })
    .catch((err) => alert("Error submitting feedback: " + err));
}


document.addEventListener("DOMContentLoaded", () => {
  feedbackForm.addEventListener("submit", handleFeedbackSubmission);
});
