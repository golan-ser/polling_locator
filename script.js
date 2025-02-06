document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.querySelector("#pollingTable tbody");
    const regionFilter = document.getElementById("regionFilter");
    const searchBox = document.getElementById("searchBox");

    async function loadPollingStations() {
        try {
            const response = await fetch("polling_stations_updated.json");
            const pollingStations = await response.json();
            console.log("נתונים שהתקבלו:", pollingStations); // בדיקה אם הנתונים נטענים
            renderTable(pollingStations);

            regionFilter.addEventListener("change", () => filterAndRender(pollingStations));
            searchBox.addEventListener("input", () => filterAndRender(pollingStations));
        } catch (error) {
            console.error("שגיאה בטעינת הנתונים:", error);
        }
    }

    function renderTable(data) {
        tableBody.innerHTML = "";
        data.forEach(station => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${station.city || "לא זמין"}</td>
                <td>${station.address || "לא זמין"}</td>
                <td>${station.region || "לא זמין"}</td>
                <td>
                    <a href="https://www.google.com/maps/search/?api=1&query=${station.lat},${station.lon}" target="_blank">
                        <img src="Google-Maps.jpg" alt="Google Maps" width="40">
                    </a> |
                    <a href="https://www.waze.com/ul?ll=${station.lat},${station.lon}&navigate=yes" target="_blank">
                        <img src="waze.jpg" alt="Waze" width="40">
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
            const matchesSearch = (station.city && station.city.toLowerCase().includes(searchText)) ||
                (station.address && station.address.toLowerCase().includes(searchText));
            return matchesRegion && matchesSearch;
        });

        renderTable(filteredStations);
    }

    loadPollingStations();
});
