# quick_test.py
from pathlib import Path
from dotenv import load_dotenv
import pymysql
import os

load_dotenv(Path("app") / ".env")

try:
    conn = pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER", "Insightmarketuser"),
        password=os.getenv("DB_PASSWORD", "1234"),
        database=os.getenv("DB_NAME", "Insightmarket")
    )
    print("✅ 연결 성공!")
    with conn.cursor() as c:
        c.execute("SHOW TABLES")
        print(f"테이블: {[t[0] for t in c.fetchall()]}")
    conn.close()
except Exception as e:
    print(f"❌ 실패: {e}")