from flask import Flask, render_template, redirect, url_for, request, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import random
import os
import pandas as pd
from io import StringIO
from flask import Response

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-secret-key-numocity'  # Change for production
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///numocity.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# --- Models ---
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # 'user' or 'operator'
    wallet_balance = db.Column(db.Float, default=100.0)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    station_name = db.Column(db.String(150), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    energy = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

class Station(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    status = db.Column(db.String(50), default='Available')  # Available, Occupied, Offline
    power = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(150), nullable=True)

# --- Loader ---
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# --- Routes ---

@app.route('/')
def index():
    if current_user.is_authenticated:
        if current_user.role == 'operator':
            return redirect(url_for('operator_dashboard'))
        return redirect(url_for('user_dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password, password):
            login_user(user)
            if user.role == 'operator':
                return redirect(url_for('operator_dashboard'))
            return redirect(url_for('user_dashboard'))
        else:
            flash('Invalid credentials')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        role = request.form.get('role')  # Expecting 'user' or 'operator' from form
        
        if User.query.filter_by(username=username).first():
            flash('Username already exists')
        else:
            new_user = User(
                username=username, 
                password=generate_password_hash(password),
                role=role
            )
            db.session.add(new_user)
            db.session.commit()
            login_user(new_user)
            if role == 'operator':
                return redirect(url_for('operator_dashboard'))
            return redirect(url_for('user_dashboard'))
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# --- User Dashboard ---
@app.route('/dashboard')
@login_required
def user_dashboard():
    if current_user.role == 'operator':
        return redirect(url_for('operator_dashboard'))
    stations = Station.query.all()
    return render_template('user_dashboard.html', stations=stations)

@app.route('/charge/<int:station_id>')
@login_required
def start_charge(station_id):
    station = Station.query.get(station_id)
    cost = 15.50  # Fixed cost for demo
    
    if station and station.status == 'Available':
        if current_user.wallet_balance >= cost:
            station.status = 'Occupied'
            current_user.wallet_balance -= cost
            
            new_tx = Transaction(
                user_id=current_user.id,
                station_name=station.name,
                amount=cost,
                energy="25 kWh"
            )
            db.session.add(new_tx)
            db.session.commit()
            flash(f'Charging started at {station.name}. ${cost} deducted.')
        else:
            flash('Insufficient wallet balance. Please top up.')
    elif station:
        flash('Station is not available.')
    return redirect(url_for('user_dashboard'))

@app.route('/history')
@login_required
def history():
    transactions = Transaction.query.filter_by(user_id=current_user.id).order_by(Transaction.timestamp.desc()).all()
    return render_template('history.html', transactions=transactions)

@app.route('/wallet', methods=['GET', 'POST'])
@login_required
def wallet():
    if request.method == 'POST':
        amount = float(request.form.get('amount', 0))
        current_user.wallet_balance += amount
        db.session.commit()
        flash(f'Successfully added ${amount} to your wallet.')
    return render_template('wallet.html')

# --- Operator Dashboard ---
@app.route('/operator')
@login_required
def operator_dashboard():
    if current_user.role != 'operator':
        return redirect(url_for('user_dashboard'))
    stations = Station.query.all()
    
    # Simple analytics
    total_stations = len(stations)
    active = len([s for s in stations if s.status == 'Occupied'])
    offline = len([s for s in stations if s.status == 'Offline'])
    
    return render_template('operator_dashboard.html', 
                           stations=stations, 
                           stats={'total': total_stations, 'active': active, 'offline': offline})

@app.route('/toggle_station/<int:station_id>')
@login_required
def toggle_station(station_id):
    if current_user.role != 'operator':
        return redirect(url_for('index'))
    station = Station.query.get(station_id)
    if station:
        if station.status == 'Offline':
            station.status = 'Available'
        else:
            station.status = 'Offline'
        db.session.commit()
    return redirect(url_for('operator_dashboard'))

@app.route('/api/analytics')
@login_required
def get_analytics():
    if current_user.role != 'operator':
        return jsonify({"error": "Unauthorized"}), 403
    
    # Use Pandas to analyze SQL data
    transactions = Transaction.query.all()
    if not transactions:
        return jsonify({"labels": [], "data": []})
        
    df = pd.DataFrame([{
        'station': t.station_name,
        'amount': t.amount,
        'energy': float(t.energy.split()[0])
    } for t in transactions])
    
    # Group by station for energy consumption
    station_stats = df.groupby('station')['energy'].sum().to_dict()
    
    return jsonify({
        "labels": list(station_stats.keys()),
        "data": list(station_stats.values())
    })

@app.route('/operator/export')
@login_required
def export_data():
    if current_user.role != 'operator':
        return redirect(url_for('index'))
    
    transactions = Transaction.query.all()
    df = pd.DataFrame([{
        'ID': t.id,
        'UserID': t.user_id,
        'Station': t.station_name,
        'Amount': t.amount,
        'Energy': t.energy,
        'Timestamp': t.timestamp
    } for t in transactions])
    
    output = StringIO()
    df.to_csv(output, index=False)
    
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=numocity_data_for_powerbi.csv"}
    )

# --- Helper to create DB ---
def init_db():
    with app.app_context():
        db.create_all()
        # Create default users if not exist
        if not User.query.filter_by(username='user').first():
            db.session.add(User(username='user', password=generate_password_hash('pass'), role='user', wallet_balance=250.0))
            db.session.add(User(username='admin', password=generate_password_hash('admin'), role='operator'))
        
        # Create default stations
        if not Station.query.first():
            stations_data = [
                {"name": "Downtown Plaza Charge", "status": "Available", "power": "120kW", "type": "DC Fast"},
                {"name": "Mall of City - Zone A", "status": "Occupied", "power": "50kW", "type": "AC Type 2"},
                {"name": "Green Park Station", "status": "Offline", "power": "150kW", "type": "DC Fast"},
                {"name": "Tech Park Hub", "status": "Available", "power": "22kW", "type": "AC Type 2"},
            ]
            for s in stations_data:
                db.session.add(Station(name=s['name'], status=s['status'], power=s['power'], type=s['type']))
        
        db.session.commit()

        # Seed some dummy transactions for analytics
        if not Transaction.query.first():
            user = User.query.filter_by(username='user').first()
            if user:
                history_data = [
                    {"name": "Downtown Plaza Charge", "energy": "45 kWh", "cost": 28.50},
                    {"name": "Mall of City - Zone A", "energy": "12 kWh", "cost": 8.40},
                    {"name": "Tech Park Hub", "energy": "30 kWh", "cost": 19.20},
                    {"name": "Downtown Plaza Charge", "energy": "22 kWh", "cost": 14.30},
                    {"name": "Mall of City - Zone A", "energy": "55 kWh", "cost": 32.10},
                ]
                for h in history_data:
                    db.session.add(Transaction(
                        user_id=user.id,
                        station_name=h['name'],
                        amount=h['cost'],
                        energy=h['energy']
                    ))
                db.session.commit()

if __name__ == '__main__':
    if not os.path.exists('numocity.db'):
        init_db()
    app.run(debug=False, port=5000)
