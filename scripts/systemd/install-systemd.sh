#!/bin/bash
# ============================================================
# DRISHTI SETU — systemd Services Installer (Ubuntu / Debian)
# ============================================================
set -e

if [ "$EUID" -ne 0 ]; then
  echo "Please run this installer as root (sudo ./install-systemd.sh)"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "Installing systemd unit files..."
cp "$SCRIPT_DIR/drishti-backend.service" /etc/systemd/system/
cp "$SCRIPT_DIR/drishti-frontend.service" /etc/systemd/system/

# Replace path placeholders if installed in a custom directory
sed -i "s|/opt/drishti-setu|$PROJECT_ROOT|g" /etc/systemd/system/drishti-backend.service
sed -i "s|/opt/drishti-setu|$PROJECT_ROOT|g" /etc/systemd/system/drishti-frontend.service

systemctl daemon-reload
systemctl enable drishti-backend.service
systemctl enable drishti-frontend.service
systemctl restart drishti-backend.service
systemctl restart drishti-frontend.service

echo "[SUCCESS] DRISHTI SETU systemd services installed, enabled, and started!"
echo "Check status:"
echo "  sudo systemctl status drishti-backend.service"
echo "  sudo systemctl status drishti-frontend.service"
