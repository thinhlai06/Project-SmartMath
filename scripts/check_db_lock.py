import sqlite3
import os

db_path = 'backend/sql_app.db'

print(f"Checking DB at {db_path}...")
if not os.path.exists(db_path):
    print("DB file not found!")
else:
    try:
        conn = sqlite3.connect(db_path, timeout=5)
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        print("DB Connection Successful!")
        conn.close()
    except Exception as e:
        print(f"DB Error: {e}")
