// Handle reservation form submission
document.getElementById('reservationForm')?.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Collect form data
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        guests: parseInt(document.getElementById('guests').value, 10)
    };

    // Send POST request to the backend
    fetch('http://127.0.0.1:5000/reservations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            // If there's an error, parse the error message
            return response.json().then(err => { throw new Error(err.error); });
        }
        return response.json();
    })
    .then(data => {
        alert('Reservation successful!');
        window.location.href = 'thankyou.html'; // Redirect to thank you page
    })
    .catch(error => {
        alert('Error: ' + error.message); // Show error message
    });
});

// Handle feedback form submission
document.getElementById('feedbackForm')?.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Collect feedback data
    const feedbackData = {
        name: document.getElementById('name').value, // Capture the customer's name
        email: document.getElementById('email').value, // Capture the customer's email
        feedback: document.getElementById('feedback').value
    };

    // Send POST request to the backend
    fetch('http://127.0.0.1:5000/feedbacks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
    })
    .then(response => {
        if (!response.ok) {
            // If there's an error, parse the error message
            return response.json().then(err => { throw new Error(err.error); });
        }
        return response.json();
    })
    .then(data => {
        alert('Feedback submitted successfully!');
        document.getElementById('feedbackForm').reset(); // Clear the form
    })
    .catch(error => {
        alert('Error: ' + error.message); // Show error message
    });
});
