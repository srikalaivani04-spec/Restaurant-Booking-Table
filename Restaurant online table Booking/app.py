from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_login import LoginManager, login_user, login_required, logout_user, UserMixin, current_user
import pyodbc
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# SQL Server connection
conn = pyodbc.connect(
    'DRIVER={ODBC Driver 18 for SQL Server};'
    'SERVER=localhost;'
    'DATABASE=RestaurantDB;'
    'UID=sa;'
    'PWD=12345678;'
)
cursor = conn.cursor()

# User class for Flask-Login
class User(UserMixin):
    def __init__(self, id_, username):
        self.id = id_
        self.username = username

@login_manager.user_loader
def load_user(user_id):
    cursor.execute("SELECT UserID, Username FROM Users WHERE UserID=?", user_id)
    row = cursor.fetchone()
    if row:
        return User(row.UserID, row.Username)
    return None

# ----------------- ROUTES -------------------

# Home page
@app.route('/')
def home():
    return render_template('ind.html')  # Your landing page

# Login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        cursor.execute("SELECT UserID, Username, PasswordHash FROM Users WHERE Username=?", username)
        row = cursor.fetchone()

        if row and check_password_hash(row.PasswordHash, password):
            user = User(row.UserID, row.Username)
            login_user(user)
            return redirect(url_for('booking'))
        return "Invalid credentials"

    return render_template('login.html')

# Logout
@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# Booking page
# Booking page
@app.route('/booking', methods=['GET', 'POST'])
@login_required
def booking():
    if request.method == 'POST':
        data = request.get_json()  # <-- get JSON from frontend

        name = data.get('name')
        email = data.get('email')
        date = data.get('date')
        time = data.get('time')
        guests = int(data.get('guests'))

        # Calculate tables reserved (4 guests per table)
        tables_reserved = max(1, -(-guests // 4))  # ceil division

        cursor.execute("""
            INSERT INTO Bookings (UserID, Name, Email, BookingDate, BookingTime, Guests, TablesReserved)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, current_user.id, name, email, date, time, guests, tables_reserved)
        conn.commit()
        return jsonify({"status": "success"}), 200

    return render_template('booking.html')


# Get bookings for logged-in user
@app.route('/my-bookings')
@login_required
def my_bookings():
    cursor.execute("""
        SELECT Name, BookingDate, BookingTime, Guests, TablesReserved
        FROM Bookings
        WHERE UserID=?
        ORDER BY BookingDate, BookingTime
    """, current_user.id)

    bookings = [{
        "name": row.Name,
        "date": str(row.BookingDate),
        "time": str(row.BookingTime),
        "guests": row.Guests,
        "tablesReserved": row.TablesReserved
    } for row in cursor.fetchall()]

    return jsonify(bookings)

if __name__ == '__main__':
    app.run(debug=True)
