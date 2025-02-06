async function findNearestPollingStation() {
    try {
        const position = await getCurrentPosition();
        console.log("✅ מיקום משתמש:", position.coords.latitude, position.coords.longitude);

        const pollingStations = await fetchPollingStations();
        console.log("✅ נתוני קלפיות שהתקבלו:", pollingStations);

        if (!pollingStations || pollingStations.length === 0) {
            throw new Error("❌ לא נמצאו קלפיות בנתונים!");
        }

        const nearest = findClosestStation(position.coords.latitude, position.coords.longitude, pollingStations);
        console.log("✅ הקלפי הקרובה ביותר:", nearest);

        displayResult(nearest);
    } catch (error) {
        console.error("❌ שגיאה:", error);
        document.getElementById('result').innerHTML = `<p>❌ שגיאה: ${error.message}</p>`;
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
        const response = await fetch('polling_stations_updated.json', {
            headers: { 'Cache-Control': 'no-cache' }
        });

        if (!response.ok) {
            throw new Error(`❌ שגיאה בטעינת הנתונים: ${response.status}`);
        }

        const data = await response.json();
        console.log("📂 JSON נטען בהצלחה:", data);
        return data;
    } catch (error) {
        console.error("❌ שגיאה בטעינת קובץ הקלפיות:", error);
        document.getElementById('result').innerHTML = "<p>❌ שגיאה בטעינת נתוני הקלפיות.</p>";
    }
}

function findClosestStation(lat, lng, stations) {
    if (!stations || stations.length === 0) {
        console.error("❌ אין נתוני קלפיות להשוואה!");
        return null;
    }

    let closestStation = null;
    let shortestDistance = Infinity;

    stations.forEach(station => {
        // וידוא שהקואורדינטות הן מספרים
        let stationLat = parseFloat(station.latitude);
        let stationLng = parseFloat(station.longitude);

        if (isNaN(stationLat) || isNaN(stationLng)) {
            console.warn("⚠️ קלפי עם נתונים חסרים:", station);
            return;
        }

        const distance = calculateDistance(lat, lng, stationLat, stationLng);
        console.log(`📍 מרחק לקלפי "${station["כתובת מלאה"]}": ${distance.toFixed(2)} ק"מ`);

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
    return R * c;
}

function displayResult(station) {
    if (!station || !station["כתובת מלאה"]) 
