document.addEventListener("DOMContentLoaded", function () {
    const findPollingBtn = document.getElementById("findPollingBtn");
    const resultBox = document.getElementById("result");
    const pollingInfo = document.querySelector(".polling-info");
    const navigationLogos = document.getElementById("navigation-logos");
    const googleMapsLink = document.getElementById("googleMapsLink");
    const wazeLink = document.getElementById("wazeLink");

    findPollingBtn.addEventListener("click", function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;

                // חישוב הקלפי הקרובה ביותר (דוגמה בלבד)
                let closestPolling = "הר תבור 1"; 
                pollingInfo.textContent = `📍 הקלפי הקרובה ביותר אליך: ${closestPolling}`;

                // הצגת התוצאה
                resultBox.classList.remove("hidden");
                navigationLogos.classList.remove("hidden");

                // יצירת קישורי ניווט
                googleMapsLink.href = `https://www.google.com/maps/search/?api=1&query=${userLat},${userLon}`;
                wazeLink.href = `https://waze.com/ul?ll=${userLat},${userLon}&navigate=yes`;
            }, function (error) {
                pollingInfo.textContent = "⚠️ לא ניתן לאתר את מיקומך. אפשר את שירותי המיקום ונסה שוב.";
                resultBox.classList.remove("hidden");
            });
        } else {
            pollingInfo.textContent = "⚠️ המכשיר שלך אינו תומך במיקום גיאוגרפי.";
            resultBox.classList.remove("hidden");
        }
    });
});
