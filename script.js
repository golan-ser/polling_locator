document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.querySelector("#pollingTable tbody");
    const regionFilter = document.getElementById("regionFilter");
    const searchBox = document.getElementById("searchBox");

    async function loadPollingStations() {
        const response = await fetch("polling_stations_updated.json");
        const pollingStations = await response.json();
        renderTable(pollingStations);

        regionFilter.addEventListener("change", () => filterAndRender(pollingStations));
        searchBox.addEventListener("input", () => filterAndRender(pollingStations));
    }

    function renderTable(data) {
        tableBody.innerHTML = "";
        data.forEach(station => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${station.region}</td>
                <td>${station.city}</td>
                <td>${station.address}</td>
                <td>
                    <a href="https://www.google.com/maps/search/?api=1&query=${station.lat},${station.lon}" target="_blank">
                        <img src="google-maps-icon.png" alt="Google Maps">
                    </a>
                    <a href="https://www.waze.com/ul?ll=${station.lat},${station.lon}&navigate=yes" target="_blank">
                        <img src="waze-icon.png" alt="Waze">
                    </a>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function filterAndRender(pollingStations) {
        const selectedRegion = regionFilter.value;
        const searchText = searchBox.value.toLowerCase();
        
        const filteredStations = pollingStations.filter(station => {
            const matchesRegion = selectedRegion === "all" || station.region === selectedRegion;
            const matchesSearch = station.city.toLowerCase().includes(searchText) ||
                station.address.toLowerCase().includes(searchText);
            return matchesRegion && matchesSearch;
        });
        
        renderTable(filteredStations);
    }

    loadPollingStations();
});
