/**
 * User Dashboard Logic (SQLite Edition)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Wait for DB
    if (app.dbReady) {
        initUserDashboard();
    } else {
        document.addEventListener('dbReady', initUserDashboard);
    }
});

function initUserDashboard() {
    const user = app.requireAuth('user');
    if (!user) return;

    // Update UI with user data
    document.getElementById('userName').textContent = user.username;
    updateWalletUI();

    // Load Views
    loadStations();
    loadHistory();

    // Event Listeners
    document.getElementById('addFundsBtn').addEventListener('click', addFunds);
}

async function updateWalletUI() {
    const user = await app.refreshUserSession(); // Get fresh wallet balance from DB
    if (user) {
        document.getElementById('userWallet').textContent = app.formatCurrency(user.wallet);
    }
}

function loadStations() {
    const stations = dbManager.query("SELECT * FROM stations");
    const grid = document.getElementById('stationsGrid');
    grid.innerHTML = '';

    stations.forEach(station => {
        const card = document.createElement('div');
        card.className = `station-card status-${station.status} glass`;

        let actionBtn = '';
        if (station.status === 'Available') {
            actionBtn = `<button onclick="startCharging(${station.id})" class="btn-primary" style="width:100%">Start Charging</button>`;
        } else if (station.status === 'Occupied') {
            actionBtn = `<button class="btn-outline" disabled style="width:100%; opacity:0.5; cursor:not-allowed">Occupied</button>`;
        } else {
            actionBtn = `<button class="btn-outline" disabled style="width:100%; opacity:0.5; cursor:not-allowed; border-color:var(--status-offline); color:var(--status-offline)">Offline</button>`;
        }

        card.innerHTML = `
            <div class="card-header">
                <div>
                    <div class="station-name">${station.name}</div>
                    <div class="station-type">${station.type} • ${station.location}</div>
                </div>
                <div class="status-badge status-${station.status}">${station.status}</div>
            </div>
            <div class="card-footer" style="border:none; padding-top:0; margin-top:0;">
                <span class="power-info">⚡ ${station.power}</span>
            </div>
            <div style="margin-top: 1rem;">
                ${actionBtn}
            </div>
        `;
        grid.appendChild(card);
    });
}

function startCharging(stationId) {
    const user = app.getCurrentUser();

    // Get fresh station data
    const stations = dbManager.query("SELECT * FROM stations WHERE id = ?", [stationId]);
    if (stations.length === 0) return;
    const station = stations[0];

    const cost = 15.50;

    if (user.wallet < cost) {
        showToast('Insufficient funds. Please top up your wallet.', 'error');
        return;
    }

    if (confirm(`Start charging at ${station.name} for ${app.formatCurrency(cost)}?`)) {
        // SQL Transaction Simulation
        try {
            // 1. Deduct Wallet
            dbManager.run("UPDATE users SET wallet = wallet - ? WHERE id = ?", [cost, user.id]);

            // 2. Update Station Status
            dbManager.run("UPDATE stations SET status = 'Occupied' WHERE id = ?", [stationId]);

            // 3. Add Transaction
            const energy = `${Math.floor(Math.random() * 30) + 10} kWh`;
            const timestamp = new Date().toISOString();
            dbManager.run(
                "INSERT INTO transactions (user_id, station_name, amount, energy, timestamp) VALUES (?, ?, ?, ?, ?)",
                [user.id, station.name, cost, energy, timestamp]
            );

            // 4. Global Save is handled by dbManager.run() automatically

            // 5. Refresh UI
            updateWalletUI(); // This will fetch the new balance
            loadStations();
            loadHistory();
            showToast(`Charging started! ${app.formatCurrency(cost)} deducted.`);
        } catch (e) {
            console.error(e);
            showToast("Transaction failed", "error");
        }
    }
}

function addFunds() {
    const amount = 50.00;
    const user = app.getCurrentUser();

    dbManager.run("UPDATE users SET wallet = wallet + ? WHERE id = ?", [amount, user.id]);

    updateWalletUI();
    showToast(`Added ${app.formatCurrency(amount)} to wallet!`);
}

function loadHistory() {
    const user = app.getCurrentUser();
    // Complex Query JOIN not strictly needed since we denormalized station_name in transactions for simplicity,
    // but we can select directly.
    const txs = dbManager.query("SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC", [user.id]);

    const container = document.getElementById('historyList');

    if (txs.length === 0) {
        container.innerHTML = '<div style="padding:1rem; color:var(--text-muted); text-align:center;">No charging history yet.</div>';
        return;
    }

    let html = '<table class="glass" style="width:100%; border-radius:16px; overflow:hidden;">';
    html += '<thead><tr><th>Station</th><th>Date</th><th>Energy</th><th>Cost</th></tr></thead><tbody>';

    txs.forEach(tx => {
        const date = new Date(tx.timestamp).toLocaleDateString();
        html += `
            <tr>
                <td>${tx.station_name}</td>
                <td>${date}</td>
                <td>${tx.energy}</td>
                <td style="font-weight:600; color:var(--primary);">${app.formatCurrency(tx.amount)}</td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}
