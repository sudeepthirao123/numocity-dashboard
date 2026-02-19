/**
 * Numocity Core Logic (SQLite Edition)
 */

class NumocityApp {
    constructor() {
        this.dbReady = false;
        // Start init
        dbManager.init().then(() => {
            this.dbReady = true;
            // Dispatch event for other scripts
            document.dispatchEvent(new Event('dbReady'));
            console.log("DB Ready Event Fired");
        });
    }

    // Helper to ensure DB is ready before usage in console or quick interactions
    async ensureDB() {
        if (!this.dbReady) {
            await dbManager.init();
            this.dbReady = true;
        }
    }

    // --- Auth ---
    login(username, password) {
        if (!this.dbReady) return { success: false, message: 'Database Loading...' };

        const users = dbManager.query("SELECT * FROM users WHERE username = ? AND password = ?", [username, password]);

        if (users.length > 0) {
            const user = users[0];
            // Store session
            localStorage.setItem('numocity_current_user', JSON.stringify({
                id: user.id,
                username: user.username,
                role: user.role,
                wallet: user.wallet
            }));
            return { success: true, role: user.role };
        }
        return { success: false, message: 'Invalid credentials' };
    }

    register(username, password, role = 'user') {
        const existing = dbManager.query("SELECT id FROM users WHERE username = ?", [username]);
        if (existing.length > 0) {
            return { success: false, message: 'Username already exists' };
        }

        const wallet = role === 'user' ? 100.00 : 0;
        dbManager.run("INSERT INTO users (username, password, role, wallet) VALUES (?, ?, ?, ?)", [username, password, role, wallet]);

        // Auto login
        return this.login(username, password);
    }

    logout() {
        localStorage.removeItem('numocity_current_user');
        window.location.href = 'index.html';
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('numocity_current_user'));
    }

    async refreshUserSession() {
        const current = this.getCurrentUser();
        if (!current) return null;

        const fresh = dbManager.query("SELECT * FROM users WHERE id = ?", [current.id]);
        if (fresh.length > 0) {
            const user = fresh[0];
            const session = {
                id: user.id,
                username: user.username,
                role: user.role,
                wallet: user.wallet
            };
            localStorage.setItem('numocity_current_user', JSON.stringify(session));
            return session;
        }
        return current;
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
