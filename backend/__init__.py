"""
DRISHTI SETU — Gujarat Police Hackathon Backend Package
"""
import sys
from pathlib import Path

# Ensure project root and backend folder are in sys.path for package imports
_BACKEND_DIR = Path(__file__).resolve().parent
_PROJECT_ROOT = _BACKEND_DIR.parent

if str(_PROJECT_ROOT) in sys.path:
    sys.path.remove(str(_PROJECT_ROOT))
sys.path.insert(0, str(_PROJECT_ROOT))
if str(_BACKEND_DIR) not in sys.path:
    sys.path.append(str(_BACKEND_DIR))
