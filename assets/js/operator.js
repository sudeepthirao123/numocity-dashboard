/**
 * Operator Dashboard Logic (SQLite Edition)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Wait for DB
    if (app.dbReady) {
        initOperatorDashboard();
    } else {
        document.addEventListener('dbReady', initOperatorDashboard);
    }
});

function initOperatorDashboard() {
    const user = app.requireAuth('operator');
    if (!user) return;

    // Load Views
    loadOverview();
    loadStationList();
    initCharts();

    // Event Listeners
    document.getElementById('exportBtn').addEventListener('click', exportCSV);
}

function loadOverview() {
    // Use SQL COUNT for efficiency
    const total = dbManager.query("SELECT COUNT(*) as count FROM stations")[0].count;
    const active = dbManager.query("SELECT COUNT(*) as count FROM stations WHERE status = 'Occupied'")[0].count;
    const offline = dbManager.query("SELECT COUNT(*) as count FROM stations WHERE status = 'Offline'")[0].count;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statActive').textContent = active;
    document.getElementById('statOffline').textContent = offline;
}

function loadStationList() {
    const stations = dbManager.query("SELECT * FROM stations");
    const container = document.getElementById('stationListBody');
    container.innerHTML = '';

    stations.forEach(s => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${s.id}</td>
            <td><strong>${s.name}</strong></td>
            <td><span class="status-badge status-${s.status}">${s.status}</span></td>
            <td>${s.power}</td>
            <td>
                <button onclick="toggleStation(${s.id})" class="btn-outline" style="padding: 0.25rem 0.75rem; font-size: 0.8rem;">
                    ${s.status === 'Offline' ? 'Activate' : 'Set Offline'}
                </button>
            </td>
        `;
        container.appendChild(row);
    });
}

function toggleStation(id) {
    // Fetch current status first
    const station = dbManager.query("SELECT status FROM stations WHERE id = ?", [id])[0];
    const newStatus = station.status === 'Offline' ? 'Available' : 'Offline';

    dbManager.run("UPDATE stations SET status = ? WHERE id = ?", [newStatus, id]);

    loadOverview();
    loadStationList();
    showToast(`Station #${id} is now ${newStatus}`);
}

function initCharts() {
    // Analytical Query: Group by station name and sum energy
    // Note: energy is stored as "45 kWh" string, so SQL SUM won't work perfectly without parsing.
    // For specific SQLite requirements we can use substr, but for safety with the string format, 
    // we'll fetch fields and process in JS, OR if we had stored energy as REAL it would be better.
    // Let's do hybrid: Fetch all transactions.

    const txs = dbManager.query("SELECT station_name, energy FROM transactions");

    const stationEnergy = {};
    txs.forEach(t => {
        const energyVal = parseFloat(t.energy); // "45 kWh" -> 45
        if (!stationEnergy[t.station_name]) {
            stationEnergy[t.station_name] = 0;
        }
        stationEnergy[t.station_name] += energyVal;
    });

    const labels = Object.keys(stationEnergy);
    const data = Object.values(stationEnergy);

    const ctx = document.getElementById('analyticsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Energy (kWh)',
                data: data,
                backgroundColor: 'rgba(0, 210, 135, 0.5)',
                borderColor: '#00d287',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function exportCSV() {
    const txs = dbManager.query("SELECT * FROM transactions");
    if (txs.length === 0) {
        showToast('No data to export', 'error');
        return;
    }

    const headers = ['ID', 'UserID', 'Station', 'Amount', 'Energy', 'Timestamp'];
    const rows = txs.map(t => [t.id, t.user_id, t.station_name, t.amount, t.energy, t.timestamp]);

    let csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "numocity_data_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
