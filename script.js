document.getElementById("findPollingBtn").addEventListener("click", findNearestPollingStation);

const tableBody = document.getElementById("tableBody");
const regionFilter = document.getElementById("regionFilter");
const searchBox = document.getElementById("searchBox");

async function fetchPollingStations() {
    try {
        const url = "https://raw.githubusercontent.com/golan-ser/polling_locator/main/polling_stations_updated.json";
        const response = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });

        if (!response.ok) {
            throw new Error(`שגיאה בטעינת הנתונים: ${response.status}`);
        }

        const text = await response.text(); // קרא כטקסט תחילה
        console.log("Response Data:", text); // בדוק מה מתקבל
        return JSON.parse(text); // נסה להמיר ל-JSON
    } catch (error) {
        console.error("שגיאה בטעינת קובץ הקלפיות:", error);
        document.getElementById('result').innerHTML = "<p style='color:red;'>שגיאה בטעינת נתוני הקלפיות.</p>";
        return [];
    }
}

async function findNearestPollingStation() {
    try {
        const position = await getCurrentPosition();
        const pollingStations = await fetchPollingStations();
        if (pollingStations.length === 0) throw new Error("לא נמצאו קלפיות בנתונים");
        const nearest = findClosestStation(position.coords.latitude, position.coords.longitude, pollingStations);
        displayResult(nearest);
    } catch (error) {
        document.getElementById('result').innerHTML = `<p style="color: red;">שגיאה: ${error.message}</p>`;
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("שירותי מיקום לא זמינים בדפדפן"));
        } else {
            navigator.geolocation.getCurrentPosition(resolve, error => {
                reject(new Error("גישה למיקום נדחתה, אנא אפשר הרשאה בדפדפן"));
            });
        }
    });
}

function findClosestStation(lat, lng, stations) {
    let closestStation = null;
    let shortestDistance = Infinity;
    stations.forEach(station => {
        const distance = calculateDistance(lat, lng, station.latitude, station.longitude);
        if (distance < shortestDistance) {
            shortestDistance = distance;
            closestStation = station;
        }
    });
    return closestStation;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function displayResult(station) {
    const resultDiv = document.getElementById('result');
    const navigationLogos = document.getElementById('navigation-logos');

    if (station) {
        resultDiv.innerHTML = `
            <p class="polling-info">📍 הקלפי הקרובה ביותר אליך: ${station.address}, ${station.city}</p>
        `;

        if (station.latitude && station.longitude) {
            document.getElementById("googleMapsLink").href = `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`;
            document.getElementById("wazeLink").href = `https://waze.com/ul?ll=${station.latitude},${station.longitude}&navigate=yes`;
            navigationLogos.classList.remove("hidden");
        } else {
            resultDiv.innerHTML += `<p style="color:red;">❌ לא נמצאו קואורדינטות.</p>`;
        }
    } else {
        resultDiv.innerHTML = `<p style="color:red;">❌ לא נמצאה קלפי קרובה.</p>`;
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
                <a href="https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}" target="_blank">
                    <img src="Google-Maps.jpg" alt="Google Maps" width="40">
                </a> |
                <a href="https://www.waze.com/ul?ll=${station.latitude},${station.longitude}&navigate=yes" target="_blank">
                    <img src="waze.jpg" alt="Waze" width="40">
                </a>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function loadPollingStations() {
    try {
        const pollingStations = await fetchPollingStations();
        filterAndRender(pollingStations);
    } catch (error) {
        console.error("שגיאה בטעינת נתוני הקלפיות:", error);
    }
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

document.addEventListener("DOMContentLoaded", loadPollingStations);
