document.addEventListener("DOMContentLoaded", () => {
    const findPollingBtn = document.getElementById("findPollingBtn");
    const googleMapsBtn = document.getElementById("googleMapsBtn");
    const wazeBtn = document.getElementById("wazeBtn");
    const navigationButtons = document.getElementById("navigation-buttons");
    const resultDiv = document.getElementById("result");

    findPollingBtn.addEventListener("click", async function () {
        try {
            const position = await getCurrentPosition();
            const pollingStations = await fetchPollingStations();
            const nearest = findClosestStation(position.coords.latitude, position.coords.longitude, pollingStations);

            if (nearest) {
                resultDiv.querySelector(".polling-info").innerHTML = `<p>📍 הקלפי הקרובה ביותר אליך: ${nearest["כתובת מלאה"]}</p>`;
                googleMapsBtn.onclick = () => openGoogleMaps(nearest.latitude, nearest.longitude);
                wazeBtn.onclick = () => openWaze(nearest.latitude, nearest.longitude);
                navigationButtons.classList.remove("hidden");
            } else {
                resultDiv.querySelector(".polling-info").innerHTML = `<p>❌ לא נמצאה קלפי קרובה.</p>`;
            }
        } catch (error) {
            resultDiv.querySelector(".polling-info").innerHTML = `<p>⚠ שגיאה: ${error.message}</p>`;
        }
    });

    function getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("שירותי מיקום לא זמינים בדפדפן."));
            } else {
                navigator.geolocation.getCurrentPosition(resolve, error => {
                    reject(new Error("גישה למיקום נדחתה, יש לאפשר הרשאה בדפדפן."));
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
                throw new Error(`שגיאה בטעינת הנתונים: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("❌ שגיאה בטעינת קובץ הקלפיות:", error);
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
        return R * c;
    }

    function openGoogleMaps(lat, lng) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
    }

    function openWaze(lat, lng) {
        window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`);
    }
});
