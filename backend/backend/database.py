from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# WHY: This is the connection string to your database.
# Replace 'password' with your actual PostgreSQL password.
DATABASE_URL = "postgresql://postgres:1980@localhost/hackathon"

# WHY: Engine is the core connection to PostgreSQL.
engine = create_engine(DATABASE_URL)

# WHY: SessionLocal lets us open/close DB sessions per API request.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# WHY: Base is the foundation for all models (tables).
Base = declarative_base()

