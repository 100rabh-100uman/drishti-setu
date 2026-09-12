"""
DRISHTI SETU — Backward Compatibility Forwarder for Supabase Client
"""
import importlib.util
from pathlib import Path

_PARENT_CLIENT_FILE = Path(__file__).resolve().parent.parent / "supabase_client.py"
_spec = importlib.util.spec_from_file_location("_top_level_supabase_client", str(_PARENT_CLIENT_FILE))
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)

supabase = _mod.supabase
url = _mod.url
key = _mod.key