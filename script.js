document.getElementById("findPollingBtn").addEventListener("click", findNearestPollingStation);

async function findNearestPollingStation() {
    try {
        const position = await getCurrentPosition();
        const pollingStations = await fetchPollingStations();
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

async function fetchPollingStations() {
    try {
        const url = "https://golan-ser.github.io/polling_locator/polling_stations_updated.json";
        console.log("🔄 מנסה למשוך נתונים מתוך:", url);
        
        const response = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });

        if (!response.ok) {
            throw new Error(`❌ שגיאה בטעינת JSON: ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("⚠️ שגיאה בטעינת JSON:", error);
        document.getElementById('result').innerHTML = "<p style='color:red;'>❌ שגיאה בטעינת רשימת הקלפיות.</p>";
        return [];
    }
}

function findClosestStation(lat, lng, stations) {
    let closestStation = null;
    let shortestDistance = Infinity;
    stations.forEach(station => {
        if (station.latitude && station.longitude) {
            const distance = calculateDistance(lat, lng, station.latitude, station.longitude);
            if (distance < shortestDistance) {
                shortestDistance = distance;
                closestStation = station;
            }
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

    if (!resultDiv) {
        console.error("⚠️ אלמנט 'result' לא נמצא ב-HTML!");
        return;
    }

    resultDiv.innerHTML = `
        <p class="polling-info">📍 הקלפי הקרובה ביותר אליך: ${station["כתובת מלאה"] || "לא זמין"}</p>
    `;

    if (station.latitude && station.longitude) {
        if (document.getElementById("googleMapsLink") && document.getElementById("wazeLink")) {
            document.getElementById("googleMapsLink").href = `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`;
            document.getElementById("wazeLink").href = `https://waze.com/ul?ll=${station.latitude},${station.longitude}&navigate=yes`;
        }

        if (navigationLogos) {
            navigationLogos.classList.remove("hidden");
        } else {
            console.warn("⚠️ אלמנט 'navigation-logos' לא נמצא, לא ניתן להציג קישורים לניווט.");
        }
    } else {
        resultDiv.innerHTML += `<p style="color:red;">❌ לא נמצאו קואורדינטות.</p>`;
    }
}
document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.querySelector("#pollingTable tbody");
    const regionFilter = document.getElementById("regionFilter");
    const searchBox = document.getElementById("searchBox");

    async function loadPollingStations() {
        try {
            const response = await fetch("https://golan-ser.github.io/polling_locator/polling_stations_updated.json");
            
            if (!response.ok) {
                throw new Error(`שגיאה בטעינת JSON: ${response.status}`);
            }

            const pollingStations = await response.json();
            console.log("✅ נתוני הקלפיות שהתקבלו:", pollingStations);

            // הצגת הטבלה עם כל הנתונים
            renderTable(pollingStations);

            // חיבור אירועים לסינון
            regionFilter.addEventListener("change", () => filterAndRender(pollingStations));
            searchBox.addEventListener("input", () => filterAndRender(pollingStations));
        } catch (error) {
            console.error("⚠️ שגיאה בטעינת רשימת הקלפיות:", error);
            document.getElementById('result').innerHTML = `<p style="color:red;">❌ שגיאה בטעינת רשימת הקלפיות.</p>`;
        }
    }
function renderTable(data) {
    const tableBody = document.querySelector("#pollingTable tbody");
    tableBody.innerHTML = "";

    data.forEach(station => {
        console.log("📌 בדיקת תחנה:", station); // הצגת הנתונים שנכנסים לטבלה

        // שימוש במפתחות כפי שהם מופיעים ב-JSON
        let cityName = station["שם הרשות"] || "⚠️ לא ידוע";
        let address = station["כתובת מלאה"] || station["כתובת קלפי"] || "⚠️ לא ידוע";
        let region = station["אזור"] || "⚠️ לא ידוע";

        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="polling-city">${cityName}</td>
            <td class="polling-address">${address}</td>
            <td class="polling-region">${region}</td>
            <td>
                <a href="https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}" target="_blank">
                    <img src="Google-Maps.jpg" alt="Google Maps" width="50">
                </a> |
                <a href="https://www.waze.com/ul?ll=${station.latitude},${station.longitude}&navigate=yes" target="_blank">
                    <img src="waze.jpg" alt="Waze" width="50">
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
            const matchesRegion = selectedRegion === "all" || station["אזור"] === selectedRegion;
            const matchesSearch = (station["שם הרשות"] || "").toLowerCase().includes(searchText) ||
                                  (station["כתובת מלאה"] || "").toLowerCase().includes(searchText);
            return matchesRegion && matchesSearch;
        });

        renderTable(filteredStations);
    }

    // טוען את הנתונים כשהדף נטען
    loadPollingStations();
});
