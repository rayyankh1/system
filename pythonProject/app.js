// reservation form submission
document.getElementById('reservationForm')?.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // This is collecting form data
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        guests: parseInt(document.getElementById('guests').value, 10)
    };

    // This is sending the request to the backend
    fetch('http://127.0.0.1:5000/reservations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {

            return response.json().then(err => { throw new Error(err.error); });
        }
        return response.json();
    })
    .then(data => {
        alert('Reservation successful!');
        window.location.href = 'thankyou.html'; // This redirects the page to thank you
    })
    .catch(error => {
        alert('Error: ' + error.message);
    });
});

// This will handle feedback form submission
document.getElementById('feedbackForm')?.addEventListener('submit', function(event) {
    event.preventDefault();

    // This collects the feedback data
    const feedbackData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        feedback: document.getElementById('feedback').value
    };


    fetch('http://127.0.0.1:5000/feedbacks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
    })
    .then(response => {
        if (!response.ok) {

            return response.json().then(err => { throw new Error(err.error); });
        }
        return response.json();
    })
    .then(data => {
        alert('Feedback submitted successfully!');
        document.getElementById('feedbackForm').reset();
    })
    .catch(error => {
        alert('Error: ' + error.message);
    });
});
