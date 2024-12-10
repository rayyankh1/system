import unittest
import json
from app import app, db, Reservation, Feedback

class TestReservationApp(unittest.TestCase):
    def setUp(self):
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        app.config['TESTING'] = True
        self.client = app.test_client()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def test_add_reservation(self):
        response = self.client.post('/reservations', json={
            'name': 'John Doe',
            'phone': '1234567890',
            'email': 'john@example.com',
            'date': '2023-12-01',
            'time': '19:00',
            'guests': 4
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn('Reservation added successfully', response.get_data(as_text=True))

    def test_add_reservation_conflict(self):
        # Add a reservation
        self.client.post('/reservations', json={
            'name': 'John Doe',
            'phone': '1234567890',
            'email': 'john@example.com',
            'date': '2023-12-01',
            'time': '19:00',
            'guests': 4
        })

        response = self.client.post('/reservations', json={
            'name': 'Jane Doe',
            'phone': '0987654321',
            'email': 'jane@example.com',
            'date': '2023-12-01',
            'time': '19:00',
            'guests': 2
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn('Reservation slot not available', response.get_data(as_text=True))

    def test_add_feedback(self):
        response = self.client.post('/feedbacks', json={
            'name': 'John Doe',
            'email': 'john@example.com',
            'feedback': 'Great service!'
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn('Feedback submitted successfully', response.get_data(as_text=True))

    def test_get_reservations(self):
        self.client.post('/reservations', json={
            'name': 'John Doe',
            'phone': '1234567890',
            'email': 'john@example.com',
            'date': '2023-12-01',
            'time': '19:00',
            'guests': 4
        })
        response = self.client.get('/reservations')
        self.assertEqual(response.status_code, 200)
        reservations = json.loads(response.get_data(as_text=True))
        self.assertEqual(len(reservations), 1)
        self.assertEqual(reservations[0]['name'], 'John Doe')

    def test_get_feedbacks(self):
        self.client.post('/feedbacks', json={
            'name': 'John Doe',
            'email': 'john@example.com',
            'feedback': 'Great service!'
        })
        response = self.client.get('/feedbacks')
        self.assertEqual(response.status_code, 200)
        feedbacks = json.loads(response.get_data(as_text=True))
        self.assertEqual(len(feedbacks), 1)
        self.assertEqual(feedbacks)