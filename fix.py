import pandas as pd

# קובץ המקור עם הבעיה
input_file = "polling_stations_with_coordinates.csv"

# קובץ חדש עם תיקון הקידוד
output_file = "polling_stations_fixed.csv"

# קריאה ושמירה מחדש עם קידוד `utf-8-sig`
df = pd.read_csv(input_file, encoding="utf-8")
df.to_csv(output_file, index=False, encoding="utf-8-sig")

print(f"✅ קובץ חדש נשמר בהצלחה: {output_file}")
