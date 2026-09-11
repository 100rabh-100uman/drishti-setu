"""
DRISHTI SETU — Backward Compatibility Forwarder
Forward all requests to backend.main
"""
import sys
from pathlib import Path

_BACKEND_DIR = Path(__file__).resolve().parent.parent
_PROJECT_ROOT = _BACKEND_DIR.parent
while str(_BACKEND_DIR) in sys.path:
    sys.path.remove(str(_BACKEND_DIR))
while str(_PROJECT_ROOT) in sys.path:
    sys.path.remove(str(_PROJECT_ROOT))

sys.path.insert(0, str(_PROJECT_ROOT))
sys.path.append(str(_BACKEND_DIR))

from backend.main import *  # noqa: F401, F403
from backend.main import app  # noqa: F401
