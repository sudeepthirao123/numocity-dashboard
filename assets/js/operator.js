/**
 * Operator Dashboard Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const user = app.requireAuth('operator');
    if (!user) return;

    // Load Views
    loadOverview();
    loadStationList();
    initCharts();

    // Event Listeners
    document.getElementById('exportBtn').addEventListener('click', exportCSV);
});

function loadOverview() {
    const stations = app.getStations();

    const total = stations.length;
    const active = stations.filter(s => s.status === 'Occupied').length;
    const offline = stations.filter(s => s.status === 'Offline').length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statActive').textContent = active;
    document.getElementById('statOffline').textContent = offline;
}

function loadStationList() {
    const stations = app.getStations();
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
    const stations = app.getStations();
    const station = stations.find(s => s.id === id);

    const newStatus = station.status === 'Offline' ? 'Available' : 'Offline';
    app.updateStation(id, { status: newStatus });

    loadOverview();
    loadStationList();
    showToast(`Station #${id} is now ${newStatus}`);
}

function initCharts() {
    const txs = app.getTransactions();

    // Process data for chart
    // Group by station name
    const stationEnergy = {};
    txs.forEach(t => {
        const energyVal = parseFloat(t.energy); // "45 kWh" -> 45
        if (!stationEnergy[t.stationName]) {
            stationEnergy[t.stationName] = 0;
        }
        stationEnergy[t.stationName] += energyVal;
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
    const txs = app.getTransactions();
    if (txs.length === 0) {
        showToast('No data to export', 'error');
        return;
    }

    const headers = ['ID', 'UserID', 'Station', 'Amount', 'Energy', 'Timestamp'];
    const rows = txs.map(t => [t.id, t.userId, t.stationName, t.amount, t.energy, t.timestamp]);

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
