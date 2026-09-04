import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Load .env from backend directory directly
current_dir = Path(__file__).resolve().parent
env_file = current_dir / ".env"
if env_file.exists():
    load_dotenv(dotenv_path=env_file)
else:
    load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    url = "https://demo-offline.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.offline_demo_mode_key"
    print("\n[!] [DRISHTI SETU NOTICE] SUPABASE_URL / SUPABASE_KEY not found in .env.")
    print(" -> Running in offline DEMO MODE. Live API features and demo credentials work seamlessly.")
    print(" -> For full Supabase cloud sync, copy .env.example to .env and add your project keys.\n")

supabase: Client = create_client(url, key)