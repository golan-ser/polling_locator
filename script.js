document.addEventListener("DOMContentLoaded", function () {
    const findBtn = document.getElementById("findPollingBtn");
    const navigationLogos = document.getElementById("navigation-logos");
    navigationLogos.style.display = "none"; // הסתרת הלוגואים בהתחלה

    findBtn.addEventListener("click", async function () {
        try {
            const position = await getCurrentPosition();
            const pollingStations = await fetchPollingStations();
            const nearest = findClosestStation(position.coords.latitude, position.coords.longitude, pollingStations);
            displayResult(nearest);
        } catch (error) {
            document.getElementById('result').innerHTML = `<p>שגיאה: ${error.message}</p>`;
        }
    });
});

async function fetchPollingStations() {
    const response = await fetch('polling_stations.json');
    return await response.json();
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
    if (station) {
        document.getElementById('result').innerHTML = `
            <p>הקלפי הקרובה ביותר אליך: <strong>${station["כתובת מלאה"]}</strong></p>
            <div class="navigation-buttons" id="navigation-logos">
                <a href="https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}" target="_blank">
                    <img src="Google-Maps.jpg" alt="Google Maps">
                </a>
                <a href="https://waze.com/ul?ll=${station.latitude},${station.longitude}&navigate=yes" target="_blank">
                    <img src="waze.jpg" alt="Waze">
                </a>
            </div>
        `;
        document.getElementById("navigation-logos").style.display = "block"; // הצגת הלוגואים אחרי שהתוצאה נמצאה
    } else {
        document.getElementById('result').innerHTML = `<p>לא נמצאה קלפי קרובה.</p>`;
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
