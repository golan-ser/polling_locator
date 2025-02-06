import requests
import json
import os
import time

# 🔹 הכנס כאן את מפתח ה-API שלך מגוגל
GOOGLE_API_KEY = "AIzaSyDZsAcbu0XCBqLj4hwk_ZY3dCBMb4o1XuI"

# 🔹 קובץ הנתונים
INPUT_FILE = "polling_stations.json"
OUTPUT_FILE = "polling_stations_updated.json"

# 🔹 בדיקת קיום הקובץ
if not os.path.exists(INPUT_FILE):
    print(f"⚠️ שגיאה: הקובץ '{INPUT_FILE}' לא נמצא! ודא שהוא נמצא באותה תיקייה עם הסקריפט.")
    exit()

# 🔹 פונקציה לקבלת קואורדינטות מ-Google Maps
def get_coordinates_google(address):
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address},+Israel&key={GOOGLE_API_KEY}"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data["status"] == "OK":
            location = data["results"][0]["geometry"]["location"]
            return location["lat"], location["lng"]
        else:
            print(f"❌ לא נמצא מיקום עבור: {address} - סטטוס: {data['status']}")
    except requests.exceptions.RequestException as e:
        print(f"⚠ שגיאה בשליפת נתונים עבור {address}: {e}")

    return None, None

# 🔹 טוען את קובץ הנתונים
with open(INPUT_FILE, "r", encoding="utf-8") as file:
    polling_stations = json.load(file)

# 🔹 עובר על כל הרשומות ומעדכן קואורדינטות חסרות
for station in polling_stations:
    if station.get("latitude") in [None, "", 0] or station.get("longitude") in [None, "", 0]:
        address = station["כתובת מלאה"]
        print(f"🔍 מחפש קואורדינטות עבור: {address}")
        
        lat, lon = get_coordinates_google(address)
        if lat and lon:
            print(f"✅ נמצא! {lat}, {lon}")
            station["latitude"] = lat
            station["longitude"] = lon
        else:
            print(f"❌ כתובת לא נמצאה: {address}")

        # 🔹 מוסיף המתנה של 2 שניות בין הבקשות למניעת חסימה
        time.sleep(2)

# 🔹 שומר את הקובץ המעודכן
with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
    json.dump(polling_stations, file, ensure_ascii=False, indent=4)

print(f"🚀 תהליך העדכון הסתיים! הנתונים נשמרו בקובץ '{OUTPUT_FILE}'.")
