document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.querySelector("#pollingTable tbody");
    const searchBox = document.getElementById("searchBox");

    async function loadPollingStations() {
        const response = await fetch("polling_stations_updated.json");
        const pollingStations = await response.json();
        renderTable(pollingStations);

        searchBox.addEventListener("input", () => filterAndRender(pollingStations));
    }

    function renderTable(data) {
        tableBody.innerHTML = "";
        data.forEach(station => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${station.city}</td>
                <td>${station.address}</td>
                <td>
                    <a href="https://www.google.com/maps/search/?api=1&query=${station.lat},${station.lon}" target="_blank">📍 Google Maps</a>
                    |
                    <a href="https://waze.com/ul?ll=${station.lat},${station.lon}&navigate=yes" target="_blank">🗺️ Waze</a>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function filterAndRender(pollingStations) {
        const searchText = searchBox.value.toLowerCase();
        
        const filteredStations = pollingStations.filter(station => 
            station.city.toLowerCase().includes(searchText) ||
            station.address.toLowerCase().includes(searchText)
        );
        
        renderTable(filteredStations);
    }

    loadPollingStations();
});
