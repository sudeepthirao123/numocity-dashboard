document.addEventListener('DOMContentLoaded', () => {
    const stationsGrid = document.getElementById('stationsGrid');
    const refreshBtn = document.getElementById('refreshBtn');

    function fetchStations() {
        // Show loading state implicitly or explicit (optional)

        // Add rotation animation to button icon if present (skipping purely for simplicity of this snippet)
        refreshBtn.innerText = 'Refreshing...';

        fetch('/api/stations')
            .then(response => response.json())
            .then(data => {
                renderStations(data);
                refreshBtn.innerText = 'Refresh Data';
            })
            .catch(error => {
                console.error('Error fetching stations:', error);
                stationsGrid.innerHTML = '<div class="loading">Failed to load data. Please try again.</div>';
                refreshBtn.innerText = 'Refresh Data';
            });
    }

    function renderStations(stations) {
        stationsGrid.innerHTML = ''; // Clear current content

        if (stations.length === 0) {
            stationsGrid.innerHTML = '<div class="loading">No stations found.</div>';
            return;
        }

        stations.forEach(station => {
            const card = document.createElement('div');
            card.className = `station-card status-${station.status}`;

            // Create status badge HTML
            let statusBadge = `<span class="status-badge">${station.status}</span>`;

            card.innerHTML = `
                <div class="card-header">
                    <div>
                        <div class="station-name">${station.name}</div>
                        <div class="station-type">${station.type}</div>
                    </div>
                    <div class="status-container ${status.status}">
                        ${statusBadge}
                    </div>
                </div>
                <div class="card-meta">
                    <span class="power-info">
                        ⚡ ${station.power}
                    </span>
                    <button class="action-btn" style="background: none; border: none; color: var(--primary); cursor: pointer;">
                        Select &rarr;
                    </button>
                </div>
            `;

            stationsGrid.appendChild(card);
        });
    }

    // Initial load
    fetchStations();

    // Event Listeners
    refreshBtn.addEventListener('click', fetchStations);
});
