document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("find-polling-button");
    const resultDiv = document.getElementById("result");
    const navigationLogos = document.getElementById("navigation-logos");

    button.addEventListener("click", async function () {
        try {
            const position = await getCurrentPosition();
            const pollingStations = await fetchPollingStations();
            const nearest = findClosestStation(position.coords.latitude, position.coords.longitude, pollingStations);
            displayResult(nearest);
            
            // הצגת הלוגואים רק לאחר חיפוש מוצלח
            if (nearest) {
                navigationLogos.style.display = "block";
            }
        } catch (error) {
            resultDiv.innerHTML = `<p style="color:red;">שגיאה: ${error.message}</p>`;
        }
    });
});

/* פונקציה לקבלת מיקום המשתמש */
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

/* פונקציה להצגת הקלפי הקרובה */
function displayResult(station) {
    const resultDiv = document.getElementById("result");
    if (station) {
        resultDiv.innerHTML = `
            <p>📍 הקלפי הקרובה ביותר אליך היא: <strong>${station["כתובת מלאה"]}</strong></p>
        `;
    } else {
        resultDiv.innerHTML = `<p style="color:red;">❌ לא נמצאה קלפי קרובה.</p>`;
    }
}
