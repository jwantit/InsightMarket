# app/config/database.py
# ============================================================
# [기능] 데이터베이스 연결 설정
# ============================================================

import pymysql

def get_connection():
    """
    데이터베이스 연결 반환
    
    Returns:
        pymysql.Connection: 데이터베이스 연결 객체
    """
    return pymysql.connect(
        host="localhost",
        user="Insightmarketuser",
        password="1234",
        database="Insightmarket",
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )

