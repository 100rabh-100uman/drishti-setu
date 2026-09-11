// ============================================================
// DRISHTI SETU — PM2 Process Manager Ecosystem
// Manages both FastAPI (Python) and Next.js (Node.js) in background
// ============================================================
// Usage:
//   npm install -g pm2
//   pm2 start ecosystem.config.js
//   pm2 status
//   pm2 logs
//   pm2 restart all
//   pm2 stop all
//   pm2 startup && pm2 save (for persistent auto-start on boot)
// ============================================================

const path = require('path');

module.exports = {
  apps: [
    {
      name: "drishti-backend",
      cwd: path.join(__dirname, "backend"),
      script: "python",
      args: "-m uvicorn main:app --host 0.0.0.0 --port 8000",
      interpreter: "none",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
      env: {
        PORT: 8000,
        HOST: "0.0.0.0",
        DEMO_MODE: "true"
      }
    },
    {
      name: "drishti-frontend",
      cwd: path.join(__dirname, "Frontend", "drishti-setu"),
      script: "npm",
      args: "start -- -p 3000 -H 0.0.0.0",
      interpreter: "none",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NEXT_PUBLIC_API_URL: "http://localhost:8000"
      }
    }
  ]
};
