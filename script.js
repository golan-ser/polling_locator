document.getElementById("findPollingBtn").addEventListener("click", findNearestPollingStation);

async function findNearestPollingStation() {
    try {
        const position = await getCurrentPosition();
        console.log("📍 מיקום נוכחי:", position.coords.latitude, position.coords.longitude);

        const pollingStations = await fetchPollingStations();
        if (!pollingStations || pollingStations.length === 0) {
            throw new Error("❌ לא נמצאו קלפיות");
        }

        const nearest = findClosestStation(position.coords.latitude, position.coords.longitude, pollingStations);
        displayResult(nearest);
    } catch (error) {
        console.error("⚠️ שגיאה:", error);
        document.getElementById('result').innerHTML = `<p style="color: red;">❌ ${error.message}</p>`;
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

// 📌 כאן עדכן את ה-URL לפי הפתרון המתאים לך!
const jsonUrl = "https://golan-ser.github.io/polling_locator/polling_stations_updated.json";

async function fetchPollingStations() {
    try {
        const response = await fetch(jsonUrl, { headers: { 'Cache-Control': 'no-cache' } });
        if (!response.ok) throw new Error(`❌ שגיאה בטעינת JSON: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("⚠️ שגיאה בטעינת JSON:", error);
        return [];
    }
}

function findClosestStation(lat, lng, stations) {
    let closestStation = null;
    let shortestDistance = Infinity;

    stations.forEach(station => {
        if (!station.latitude || !station.longitude) return; // דילוג על ערכים חסרים

        const distance = calculateDistance(lat, lng, station.latitude, station.longitude);
        if (distance < shortestDistance) {
            shortestDistance = distance;
            closestStation = station;
        }
    });

    console.log(`📍 הקלפי הקרובה ביותר במרחק של ${shortestDistance.toFixed(2)} ק"מ`, closestStation);
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
    if (!resultDiv) {
        console.error("⚠️ אלמנט 'result' לא נמצא ב-HTML!");
        return;
    }

    if (station) {
        resultDiv.innerHTML = `
            <p class="polling-info">📍 הקלפי הקרובה ביותר אליך:</p>
            <p><strong>${station["כתובת מלאה"] || "לא זמין"}</strong></p>
            <p>📌 אזור: ${station["אזור"] || "לא זמין"}</p>
        `;

        if (station.latitude && station.longitude) {
            document.getElementById("googleMapsLink").href = `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`;
            document.getElementById("wazeLink").href = `https://waze.com/ul?ll=${station.latitude},${station.longitude}&navigate=yes`;
            document.getElementById("navigation-logos").classList.remove("hidden");
        } else {
            resultDiv.innerHTML += `<p style="color:red;">❌ לא נמצאו קואורדינטות.</p>`;
        }
    } else {
        resultDiv.innerHTML = `<p style="color:red;">❌ לא נמצאה קלפי קרובה.</p>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ העמוד נטען בהצלחה!");
});
