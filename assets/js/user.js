/**
 * User Dashboard Logic
 */

document.addEventListener('DOMContentLoaded', () => {
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
});

function updateWalletUI() {
    const user = app.getCurrentUser();
    document.getElementById('userWallet').textContent = app.formatCurrency(user.wallet);
}

function loadStations() {
    const stations = app.getStations();
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
    const stations = app.getStations();
    const station = stations.find(s => s.id === stationId);

    // Simulation cost
    const cost = 15.50;

    if (user.wallet < cost) {
        showToast('Insufficient funds. Please top up your wallet.', 'error');
        return;
    }

    if (confirm(`Start charging at ${station.name} for ${app.formatCurrency(cost)}?`)) {
        // 1. Deduct Wallet
        user.wallet -= cost;
        app.updateUser(user);
        updateWalletUI();

        // 2. Update Station Status
        app.updateStation(stationId, { status: 'Occupied' });

        // 3. Add Transaction
        app.addTransaction({
            userId: user.id,
            stationName: station.name,
            amount: cost,
            energy: `${Math.floor(Math.random() * 30) + 10} kWh`
        });

        // 4. Refresh UI
        loadStations();
        loadHistory();
        showToast(`Charging started! ${app.formatCurrency(cost)} deducted.`);
    }
}

function addFunds() {
    const amount = 50.00;
    const user = app.getCurrentUser();
    user.wallet += amount;
    app.updateUser(user);
    updateWalletUI();
    showToast(`Added ${app.formatCurrency(amount)} to wallet!`);
}

function loadHistory() {
    const user = app.getCurrentUser();
    const txs = app.getTransactions(user.id);
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
                <td>${tx.stationName}</td>
                <td>${date}</td>
                <td>${tx.energy}</td>
                <td style="font-weight:600; color:var(--primary);">${app.formatCurrency(tx.amount)}</td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}
