from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, time, timezone
# for password hashing taken from online
from werkzeug.security import generate_password_hash, check_password_hash # For password hashing
import random

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///restaurant.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app, resources={r"/*": {"origins": "*"}})

# Models
class Table(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    capacity = db.Column(db.Integer, nullable=False)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)  # name
    phone = db.Column(db.String(20), nullable=False)  # Phone number
    email = db.Column(db.String(120), nullable=False)  # Email address
    date = db.Column(db.Date, nullable=False)  # Reservation date
    start_time = db.Column(db.Time, nullable=False)  # Reservation start time
    end_time = db.Column(db.Time, nullable=False)  # Reservation end time
    number_of_guests = db.Column(db.Integer, nullable=False)  # Number of guests

class ReservationTable(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    reservation_id = db.Column(db.Integer, db.ForeignKey('reservation.id'), nullable=False)
    table_id = db.Column(db.Integer, db.ForeignKey('table.id'), nullable=False)
    reservation = db.relationship('Reservation', backref='reserved_tables')
    table = db.relationship('Table', backref='reservation_times')

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    feedback = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))





@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400

        user = User.query.filter_by(username=username).first()
        if not user or not check_password_hash(user.password, password):
            return jsonify({'error': 'Invalid credentials'}), 401

        return jsonify({'message': 'Login successful', 'is_admin': user.is_admin}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Return all tables
@app.route('/tables', methods=['GET'])
def get_all_tables():
    try:
        tables = Table.query.all()
        return jsonify([{
            'id': table.id,
            'capacity': table.capacity
        } for table in tables]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Return available tables for a given date and time
@app.route('/tables/available', methods=['GET'])
def get_available_tables():
    try:

        print("Incoming Request Args:", request.args)


        date = request.args.get('date')
        start_time = request.args.get('start_time')
        end_time = request.args.get('end_time')


        print(f"Extracted Parameters -> Date: {date}, Start Time: {start_time}, End Time: {end_time}")

        if not date or not start_time or not end_time:
            return jsonify({'error': 'Date, start_time, and end_time parameters are required'}), 400


        reservation_date = datetime.strptime(date, '%Y-%m-%d').date()
        start_time = datetime.strptime(start_time, '%H:%M').time()
        end_time = datetime.strptime(end_time, '%H:%M').time()


        print(f"Parsed Parameters -> Reservation Date: {reservation_date}, Start Time: {start_time}, End Time: {end_time}")


        reserved_table_ids = db.session.query(ReservationTable.table_id).join(Reservation).filter(
            Reservation.date == reservation_date,
            db.or_(

                db.and_(Reservation.start_time < end_time, Reservation.end_time > start_time)
            )
        ).distinct().all()
        reserved_table_ids = [table_id[0] for table_id in reserved_table_ids]

        # Log reserved table IDs
        print(f"Reserved Table IDs: {reserved_table_ids}")

        # Fetch available tables
        available_tables = Table.query.filter(~Table.id.in_(reserved_table_ids)).all()

        # Log available tables
        print(f"Available Tables: {available_tables}")

        return jsonify([{
            'id': table.id,
            'capacity': table.capacity
        } for table in available_tables]), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({'error': str(e)}), 500
    
# 2.5 - Create Table
@app.route('/tables', methods=['POST'])
def create_table():
    try:
        data = request.json
        capacity = data.get('capacity')
        if not capacity or capacity <= 0:
            return jsonify({'error': 'Invalid capacity'}), 400

        new_table = Table(capacity=capacity)
        db.session.add(new_table)
        db.session.commit()

        return jsonify({'message': 'Table created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500  
    

# 3. Return all reservations
@app.route('/reservations', methods=['GET'])
def get_reservations():
    try:
        reservations = Reservation.query.all()
        return jsonify([{
            'id': r.id,
            'name': r.name,
            'phone': r.phone,
            'email': r.email,
            'date': r.date.isoformat(),
            'start_time': r.start_time.strftime('%H:%M'),
            'end_time': r.end_time.strftime('%H:%M'),
            'number_of_guests': r.number_of_guests,
            'tables': [rt.table_id for rt in r.reserved_tables]
        } for r in reservations]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 4. Create a reservation
@app.route('/reservations', methods=['POST'])
def add_reservation():
    try:
        data = request.json
        reservation_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        end_time = datetime.strptime(data['end_time'], '%H:%M').time()
        num_guests = data['number_of_guests']
        table_id = data['table_id']

        # Validate end_time > start_time
        if end_time <= start_time:
            return jsonify({'error': 'End time must be after start time'}), 400

        # Check table capacity
        table = Table.query.get(table_id)
        if not table or table.capacity < num_guests:
            return jsonify({'error': 'Table does not exist or cannot accommodate the number of guests'}), 400

        # Check table availability
        overlapping_reservations = db.session.query(ReservationTable).join(Reservation).filter(
            ReservationTable.table_id == table_id,
            Reservation.date == reservation_date,
            ((Reservation.start_time <= start_time) & (Reservation.end_time > start_time)) |  # Overlap case 1
            ((Reservation.start_time < end_time) & (Reservation.end_time >= end_time)) |   # Overlap case 2
            ((Reservation.start_time >= start_time) & (Reservation.end_time <= end_time))  # Fully within
        ).first()

        if overlapping_reservations:
            return jsonify({'error': 'Table is already reserved during the selected time'}), 400


        reservation = Reservation(
            name=data['name'],
            phone=data['phone'],
            email=data['email'],
            date=reservation_date,
            start_time=start_time,
            end_time=end_time,
            number_of_guests=num_guests
        )
        db.session.add(reservation)
        db.session.commit()

        reservation_table = ReservationTable(
            reservation_id=reservation.id,
            table_id=table_id
        )
        db.session.add(reservation_table)
        db.session.commit()

        return jsonify({'message': 'Reservation created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/feedbacks', methods=['GET'])
def get_feedbacks():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 5))
        feedbacks_query = Feedback.query.paginate(page=page, per_page=limit)
        feedbacks = [{
            'id': f.id,
            'name': f.name,
            'email': f.email,
            'feedback': f.feedback,
            'created_at': f.created_at.isoformat()
        } for f in feedbacks_query.items]

        return jsonify({
            'feedbacks': feedbacks,
            'page': feedbacks_query.page,
            'total_pages': feedbacks_query.pages,
            'total_feedbacks': feedbacks_query.total
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 6. Create feedback
@app.route('/feedbacks', methods=['POST'])
def add_feedback():
    try:
        data = request.json
        feedback = Feedback(
            name=data['name'],
            email=data['email'],
            feedback=data['feedback']
        )
        db.session.add(feedback)
        db.session.commit()

        return jsonify({'message': 'Feedback submitted successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/feedbacks/<int:feedback_id>', methods=['GET'])
def get_feedback_by_id(feedback_id):
    try:
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404

        return jsonify({
            'id': feedback.id,
            'name': feedback.name,
            'email': feedback.email,
            'feedback': feedback.feedback,
            'created_at': feedback.created_at.isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():

        db.drop_all()
        db.create_all()


        if User.query.filter_by(username="rayyan").first() is None:
            admin_user = User(
                username="rayyan",
                password=generate_password_hash("123456@", method='pbkdf2:sha256'),
                is_admin=True
            )
            db.session.add(admin_user)
            db.session.commit()
            print("Admin user created: rayyan")


        if Table.query.count() == 0:
            for tid in range(1, 21):
                random_capacity = random.randint(4, 11)
                new_table = Table(id=tid, capacity=random_capacity)
                db.session.add(new_table)
            db.session.commit()
            print("Tables seeded successfully.")


        if Feedback.query.count() == 0:
            dummy_feedback = Feedback(
                name="Test User",
                email="testuser@example.com",
                feedback="This is a sample feedback entry to test the system."
            )
            db.session.add(dummy_feedback)
            db.session.commit()
            print("Dummy feedback added.")


    app.run(debug=True)
