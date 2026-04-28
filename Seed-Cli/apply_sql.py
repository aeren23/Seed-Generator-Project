import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv("DB_CONNECTION_STRING")

cache_dir = ".demo_cache"
sql_files = [f for f in os.listdir(cache_dir) if f.endswith(".sql")]
if not sql_files:
    print("SQL dosyası bulunamadı!")
    exit(1)

latest_file = max([os.path.join(cache_dir, f) for f in sql_files], key=os.path.getmtime)
print(f"Uygulanan dosya: {latest_file}")

with open(latest_file, "r", encoding="utf-8") as f:
    sql_content = f.read()

tables = [
    "AspNetUserRoles", "AspNetUserClaims", "AspNetUserLogins", "AspNetUserTokens",
    "AspNetRoleClaims", "AspNetUsers", "AspNetRoles",
    "BasketItems", "Baskets", "Sales", "Books", "Categories"
]

try:
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cur = conn.cursor()
    
    print("Tablolar temizleniyor...")
    for table in tables:
        try:
            cur.execute(f'TRUNCATE TABLE "{table}" CASCADE;')
        except:
            pass # Tablo yoksa geç
            
    print("Veriler sıfırdan işleniyor...")
    cur.execute(sql_content)
    print("BAŞARILI: Veritabanı sıfırlandı ve tüm veriler yüklendi!")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"HATA: {e}")
