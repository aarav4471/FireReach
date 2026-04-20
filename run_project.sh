#!/bin/bash
# Startup script for FireReach

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "🚀 Starting FireReach Outreach Engine..."

# Start Backend
echo "Starting Backend (Port 8000)..."
cd backend
source venv/bin/activate
nohup uvicorn main:app --reload --port 8000 > backend_logs.txt 2>&1 &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "Starting Frontend (Port 5173)..."
cd frontend
nohup npm run dev > frontend_logs.txt 2>&1 &
FRONTEND_PID=$!
cd ..

echo "✅ Project is running!"
echo "Backend PID: $BACKEND_PID (logs: backend/backend_logs.txt)"
echo "Frontend PID: $FRONTEND_PID (logs: frontend/frontend_logs.txt)"
echo "UI: http://localhost:5173"
echo "To stop: kill $BACKEND_PID $FRONTEND_PID"
