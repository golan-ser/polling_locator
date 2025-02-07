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
        const distance = calculateDistance(lat, lng, station.latitude, station.longitude);
        if (distance < shortestDistance) {
            shortestDistance = distance;
            closestStation = station;
        }
    });
    return closestStation;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // רדיוס כדור הארץ בק"מ
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // התוצאה בקילומטרים
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

document.addEventListener("DOMContentLoaded", loadPollingStations);
let pollingStations = [];

// שליפת הנתונים מה-JSON
async function fetchData() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/golan-ser/polling_locator/refs/heads/main/polling_stations_updated.json");
        pollingStations = await response.json();
        renderTable(pollingStations);
    } catch (error) {
        console.error("❌ שגיאה בטעינת הנתונים:", error);
    }
}

// פונקציה להצגת הנתונים בטבלה
function renderTable(data) {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    data.forEach(station => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${station["שם הרשות"] || "לא זמין"}</td>
            <td>${station["כתובת מלאה"] || "לא זמין"}</td>
            <td>${station["אזור"] || "לא זמין"}</td>
            <td>
                ${station.latitude && station.longitude 
                    ? `<a href="https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}" target="_blank">מפות</a> |
                       <a href="https://www.waze.com/ul?ll=${station.latitude},${station.longitude}&navigate=yes" target="_blank">וייז</a>` 
                    : "לא זמין"}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// פונקציות לסינון וחיפוש
function filterTable() {
    const region = document.getElementById("regionFilter").value;
    const searchTerm = document.getElementById("searchBox").value.trim();

    const filteredData = pollingStations.filter(station => {
        const matchesRegion = region === "all" || station["אזור"] === region;
        const matchesSearch = searchTerm === "" ||
            station["שם הרשות"].includes(searchTerm) ||
            station["כתובת מלאה"].includes(searchTerm);
        return matchesRegion && matchesSearch;
    });

    renderTable(filteredData);
}

// האזנה לשינויים בסינון
document.getElementById("regionFilter").addEventListener("change", filterTable);
document.getElementById("searchBox").addEventListener("input", filterTable);

// טעינת הנתונים כשנפתח העמוד
fetchData();
