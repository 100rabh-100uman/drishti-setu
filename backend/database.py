from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# WHY: This is the connection string to your database.
# Replace 'password' with your actual PostgreSQL password or set DATABASE_URL in .env
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1980@localhost/hackathon")

# WHY: Base is the foundation for all models (tables).
Base = declarative_base()

# WHY: Engine is the core connection to PostgreSQL.
try:
    engine = create_engine(DATABASE_URL)
    # WHY: SessionLocal lets us open/close DB sessions per API request.
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    engine = None
    SessionLocal = None

def get_db():
    if SessionLocal is None:
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
