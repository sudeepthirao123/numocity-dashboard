/**
 * Numocity Database Logic (SQLite via sql.js)
 * Handles persistence by saving the binary DB dump to LocalStorage.
 */

class DatabaseManager {
    constructor() {
        this.db = null;
        this.SQL = null;
    }

    async init() {
        if (this.db) return; // Already initialized

        // Load sql.js WASM
        if (typeof initSqlJs === 'undefined') {
            console.error("sql.js not loaded");
            return;
        }

        try {
            this.SQL = await initSqlJs({
                // Locate the WASM file. We use CDN for GitHub Pages compatibility.
                locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
            });

            // Check for saved DB in LocalStorage
            const savedDb = localStorage.getItem('numocity_sqlite_db');
            if (savedDb) {
                const u8 = new Uint8Array(JSON.parse(savedDb));
                this.db = new this.SQL.Database(u8);
                console.log("Loaded existing SQLite DB");
            } else {
                this.db = new this.SQL.Database();
                this.seedData();
                this.save();
                console.log("Created new SQLite DB");
            }
        } catch (err) {
            console.error("Failed to initialize database:", err);
            // Fallback or error handling
            showToast("Failed to load database. Please refresh.", "error");
        }
    }

    seedData() {
        // Create Tables
        this.db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                wallet REAL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS stations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                status TEXT NOT NULL,
                power TEXT NOT NULL,
                type TEXT NOT NULL,
                location TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                station_name TEXT,
                amount REAL,
                energy TEXT,
                timestamp TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );
        `);

        // Seed Users
        this.db.run(`INSERT INTO users (username, password, role, wallet) VALUES ('user', 'password', 'user', 250.00)`);
        this.db.run(`INSERT INTO users (username, password, role, wallet) VALUES ('admin', 'admin', 'operator', 0.00)`);

        // Seed Stations
        const stations = [
            ["Downtown Plaza Charge", "Available", "120kW", "DC Fast", "City Center"],
            ["Mall of City - Zone A", "Occupied", "50kW", "AC Type 2", "Shopping District"],
            ["Green Park Station", "Offline", "150kW", "DC Fast", "Suburbs"],
            ["Tech Park Hub", "Available", "22kW", "AC Type 2", "Business Park"],
            ["Highway Rest Stop #42", "Available", "350kW", "Ultra Fast", "Highway Exit 5"],
            ["EcoVillage Community", "Available", "7kW", "AC Type 1", "Residential Area"]
        ];

        const stmt = this.db.prepare("INSERT INTO stations (name, status, power, type, location) VALUES (?,?,?,?,?)");
        stations.forEach(s => stmt.run(s));
        stmt.free();

        // Seed Transactions
        const txs = [
            [1, "Downtown Plaza Charge", 28.50, "45 kWh", "2023-10-10T14:30:00"],
            [1, "Mall of City - Zone A", 8.40, "12 kWh", "2023-10-12T09:15:00"],
            [1, "Tech Park Hub", 19.20, "30 kWh", "2023-10-15T18:45:00"]
        ];
        const txStmt = this.db.prepare("INSERT INTO transactions (user_id, station_name, amount, energy, timestamp) VALUES (?,?,?,?,?)");
        txs.forEach(t => txStmt.run(t));
        txStmt.free();
    }

    // Execute query and return rows as objects
    query(sql, params = []) {
        if (!this.db) {
            console.error("DB not ready");
            return [];
        }

        // sql.js returns [{columns:[], values:[[]]}]
        const result = this.db.exec(sql, params);
        if (result.length === 0) return [];

        const columns = result[0].columns;
        const values = result[0].values;

        return values.map(row => {
            const obj = {};
            columns.forEach((col, i) => {
                obj[col] = row[i];
            });
            return obj;
        });
    }

    // Run command (Insert/Update/Delete) and save
    run(sql, params = []) {
        if (!this.db) return false;
        this.db.run(sql, params);
        this.save();
        return true;
    }

    save() {
        const data = this.db.export();
        // Convert Uint8Array to Array for JSON storage (LocalStorage only stores strings)
        // This is inefficient for huge DBs but fine for a demo dashboard.

        const arr = Array.from(data);
        localStorage.setItem('numocity_sqlite_db', JSON.stringify(arr));
    }
}

const dbManager = new DatabaseManager();
