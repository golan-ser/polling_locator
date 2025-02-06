import pandas as pd
import requests
import time

# טען את קובץ ה-CSV
csv_file_path = "polling_stations.csv"  # ודא שהקובץ נמצא באותה תיקייה
df = pd.read_csv(csv_file_path, encoding="utf-8")

# בדיקה שהעמודה "כתובת מלאה" קיימת
if "כתובת מלאה" not in df.columns:
    raise ValueError("עמודת 'כתובת מלאה' לא נמצאה בקובץ. בדוק את שמות העמודות.")

# פונקציה לקבלת קואורדינטות מ-OpenStreetMap Nominatim API
def get_coordinates(address):
    url = f"https://nominatim.openstreetmap.org/search?q={address}&format=json&accept-language=he"
    headers = {"User-Agent": "Mozilla/5.0"}  # הוספת User-Agent למניעת חסימות
    
    try:
        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code != 200:
            print(f"⚠ שגיאה בטעינת הנתונים עבור {address}: קוד {response.status_code}")
            return None, None

        data = response.json()
        if data:
            return float(data[0]["lat"]), float(data[0]["lon"])
        else:
            print(f"⚠ לא נמצאו תוצאות עבור: {address}")

    except Exception as e:
        print(f"❌ שגיאה בקבלת קואורדינטות עבור {address}: {e}")
    
    return None, None

# הוספת עמודות חדשות לקואורדינטות
df["latitude"] = None
df["longitude"] = None

# עדכון הקואורדינטות לפי הכתובת
for index, row in df.iterrows():
    address = row["כתובת מלאה"]
    lat, lon = get_coordinates(address)
    df.at[index, "latitude"] = lat
    df.at[index, "longitude"] = lon
    print(f"{address} -> lat: {lat}, lon: {lon}")
    time.sleep(2)  # האטת הבקשות למניעת חסימה

# שמירת הנתונים המעודכנים בקובץ CSV + JSON
updated_csv_file_path = "polling_stations_with_coordinates.csv"
updated_json_file_path = "polling_stations_with_coordinates.json"

df.to_csv(updated_csv_file_path, index=False, encoding="utf-8-sig")  # CSV עם קידוד מתאים ל-Excel
df.to_json(updated_json_file_path, orient="records", force_ascii=False, indent=4)  # JSON קריא

print(f"\n✅ קובץ CSV נשמר בהצלחה: {updated_csv_file_path}")
print(f"✅ קובץ JSON נשמר בהצלחה: {updated_json_file_path}")
