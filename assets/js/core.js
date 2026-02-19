/**
 * Numocity Core Logic
 * Handles Data Persistence (localStorage), Authentication, and Shared Utilities
 */

const DB_KEYS = {
    USERS: 'numocity_users',
    CURRENT_USER: 'numocity_current_user',
    STATIONS: 'numocity_stations',
    TRANSACTIONS: 'numocity_transactions'
};

const DEFAULT_DATA = {
    stations: [
        { id: 1, name: "Downtown Plaza Charge", status: "Available", power: "120kW", type: "DC Fast", location: "City Center" },
        { id: 2, name: "Mall of City - Zone A", status: "Occupied", power: "50kW", type: "AC Type 2", location: "Shopping District" },
        { id: 3, name: "Green Park Station", status: "Offline", power: "150kW", type: "DC Fast", location: "Suburbs" },
        { id: 4, name: "Tech Park Hub", status: "Available", power: "22kW", type: "AC Type 2", location: "Business Park" },
        { id: 5, name: "Highway Rest Stop #42", status: "Available", power: "350kW", type: "Ultra Fast", location: "Highway Exit 5" },
        { id: 6, name: "EcoVillage Community", status: "Available", power: "7kW", type: "AC Type 1", location: "Residential Area" }
    ],
    users: [
        { id: 1, username: 'user', password: 'password', role: 'user', wallet: 250.00 },
        { id: 2, username: 'admin', password: 'admin', role: 'operator', wallet: 0.00 }
    ],
    transactions: [
        { id: 101, userId: 1, stationName: "Downtown Plaza Charge", amount: 28.50, energy: "45 kWh", timestamp: "2023-10-10T14:30:00" },
        { id: 102, userId: 1, stationName: "Mall of City - Zone A", amount: 8.40, energy: "12 kWh", timestamp: "2023-10-12T09:15:00" },
        { id: 103, userId: 1, stationName: "Tech Park Hub", amount: 19.20, energy: "30 kWh", timestamp: "2023-10-15T18:45:00" }
    ]
};

class NumocityApp {
    constructor() {
        this.initDB();
    }

    initDB() {
        if (!localStorage.getItem(DB_KEYS.STATIONS)) {
            localStorage.setItem(DB_KEYS.STATIONS, JSON.stringify(DEFAULT_DATA.stations));
        }
        if (!localStorage.getItem(DB_KEYS.USERS)) {
            // In a real app, passwords would be hashed. This is a demo.
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(DEFAULT_DATA.users));
        }
        if (!localStorage.getItem(DB_KEYS.TRANSACTIONS)) {
            localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_DATA.transactions));
        }
    }

    // --- Auth ---
    login(username, password) {
        const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS));
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            const sessionUser = { ...user };
            delete sessionUser.password; // Don't store password in session
            localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
            return { success: true, role: user.role };
        }
        return { success: false, message: 'Invalid credentials' };
    }

    register(username, password, role = 'user') {
        const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS));
        if (users.find(u => u.username === username)) {
            return { success: false, message: 'Username already exists' };
        }

        const newUser = {
            id: Date.now(),
            username,
            password,
            role,
            wallet: role === 'user' ? 100.00 : 0
        };

        users.push(newUser);
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        
        // Auto login
        this.login(username, password);
        return { success: true, role };
    }

    logout() {
        localStorage.removeItem(DB_KEYS.CURRENT_USER);
        window.location.href = 'index.html';
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER));
    }

    requireAuth(allowedRole = null) {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = 'index.html';
            return null;
        }
        if (allowedRole && user.role !== allowedRole) {
            window.location.href = user.role === 'operator' ? 'operator.html' : 'dashboard.html';
            return null;
        }
        return user;
    }

    updateUser(updatedUser) {
        // Update current session
        localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
        
        // Update DB
        const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS));
        const index = users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updatedUser, password: users[index].password }; // Presley password
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        }
    }

    // --- Data Access ---
    getStations() {
        return JSON.parse(localStorage.getItem(DB_KEYS.STATIONS));
    }

    updateStation(id, updates) {
        const stations = this.getStations();
        const index = stations.findIndex(s => s.id === id);
        if (index !== -1) {
            stations[index] = { ...stations[index], ...updates };
            localStorage.setItem(DB_KEYS.STATIONS, JSON.stringify(stations));
            return true;
        }
        return false;
    }

    getTransactions(userId = null) {
        const txs = JSON.parse(localStorage.getItem(DB_KEYS.TRANSACTIONS));
        if (userId) {
            return txs.filter(t => t.userId === userId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }
        return txs;
    }

    addTransaction(transaction) {
        const txs = this.getTransactions();
        txs.push({ ...transaction, id: Date.now(), timestamp: new Date().toISOString() });
        localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(txs));
    }

    // --- Formatting ---
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
}

const app = new NumocityApp();

// UI Utils
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => container.removeChild(toast), 300);
    }, 3000);
}
