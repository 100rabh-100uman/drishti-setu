from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()  # loads .env file

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(url, key)
