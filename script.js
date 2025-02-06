document.getElementById("findPollingBtn").addEventListener("click", findNearestPollingStation);

async function findNearestPollingStation() {
    try {
        const position = await getCurrentPosition();
        console.log("מיקום נוכחי:", position.coords.latitude, position.coords.longitude);

        const pollingStations = await fetchPollingStations();
        if (!pollingStations || pollingStations.length === 0) {
            throw new Error("לא נמצאו קלפיות");
        }

        const nearest = findClosestStation(position.coords.latitude, position.coords.longitude, pollingStations);
        displayResult(nearest);
    } catch (error) {
        console.error("שגיאה:", error);
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.innerHTML = `<p style="color: red;">שגיאה: ${error.message}</p>`;
        }
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
        const proxyUrl = "https://cors-anywhere.herokuapp.com/"; // זמני לבדיקות בלבד
        const url = "https://raw.githubusercontent.com/golan-ser/polling_locator/main/polling_stations_updated.json";

        const response = await fetch(proxyUrl + url, { headers: { 'Cache-Control': 'no-cache' } });
        if (!response.ok) {
            throw new Error(`שגיאה בטעינת הנתונים: ${response.status}`);
        }

        const text = await response.text();
        console.log("JSON Response:", text);
        return JSON.parse(text);
    } catch (error) {
        console.error("שגיאה בטעינת JSON:", error);
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
    if (!resultDiv) {
        console.error("אלמנט 'result' לא נמצא ב-HTML!");
        return;
    }

    if (station) {
        resultDiv.innerHTML = `
            <p class="polling-info">📍 הקלפי הקרובה ביותר אליך: ${station.address}, ${station.city}</p>
        `;
    } else {
        resultDiv.innerHTML = `<p style="color:red;">❌ לא נמצאה קלפי קרובה.</p>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("העמוד נטען!");
});
