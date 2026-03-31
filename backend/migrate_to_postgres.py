"""SQLite-ээс PostgreSQL руу өгөгдөл шилжүүлэх скрипт.

Ашиглах:
  DATABASE_URL=postgresql://geregnews:pass@localhost:5432/geregnews python migrate_to_postgres.py
"""
import os
import sqlite3
from dotenv import load_dotenv

load_dotenv()

SQLITE_PATH = os.getenv("SQLITE_PATH", "news.db")
PG_URL = os.getenv("DATABASE_URL", "")

if not PG_URL.startswith("postgresql"):
    print("ERROR: DATABASE_URL must be a PostgreSQL URL")
    exit(1)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import models to register them
from app.database import Base
from app.models.article import Article
from app.models.user import User
from app.models.bookmark import Bookmark
from app.models.ad import Ad
from app.models.push_subscription import PushSubscription
from app.models.analytics import PageView, DailyStat

# Connect to PostgreSQL
pg_engine = create_engine(PG_URL, pool_pre_ping=True)
Base.metadata.create_all(bind=pg_engine)
PgSession = sessionmaker(bind=pg_engine)
pg = PgSession()

# Read from SQLite
conn = sqlite3.connect(SQLITE_PATH)
conn.row_factory = sqlite3.Row

tables = [
    ("articles", Article),
    ("users", User),
    ("bookmarks", Bookmark),
    ("ads", Ad),
    ("push_subscriptions", PushSubscription),
    ("page_views", PageView),
    ("daily_stats", DailyStat),
]

for table_name, Model in tables:
    try:
        rows = conn.execute(f"SELECT * FROM {table_name}").fetchall()
        if not rows:
            print(f"  {table_name}: 0 rows (skip)")
            continue

        columns = [desc[0] for desc in conn.execute(f"SELECT * FROM {table_name} LIMIT 1").description]

        for row in rows:
            data = {col: row[col] for col in columns}
            pg.merge(Model(**data))

        pg.commit()
        print(f"  {table_name}: {len(rows)} rows migrated")
    except Exception as e:
        pg.rollback()
        print(f"  {table_name}: ERROR - {e}")

conn.close()
pg.close()
print("Done!")
