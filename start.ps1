Write-Host "Starting OpsPilot Setup (No Docker)..."

# 1. Setup and Start Simulator
Write-Host "Setting up Simulator environment..."
Set-Location -Path "d:\Parallax\opspilot\simulator"
if (-not (Test-Path "venv")) {
    python -m venv venv
}
.\venv\Scripts\python -m pip install -r requirements.txt
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '.\venv\Scripts\uvicorn.exe' main:app --port 8001 --reload"

# 2. Setup and Start Backend
Write-Host "Setting up Backend environment..."
Set-Location -Path "d:\Parallax\opspilot\backend"
if (-not (Test-Path "venv")) {
    python -m venv venv
}
.\venv\Scripts\python -m pip install -r requirements.txt
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '.\venv\Scripts\uvicorn.exe' app.main:app --port 8000 --reload"

# 3. Setup and Start Frontend
Write-Host "Setting up Frontend environment..."
Set-Location -Path "d:\Parallax\opspilot\frontend"
npm install
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "All services have been started in separate windows!"
Write-Host "Frontend is running at http://localhost:5173"
Write-Host "Backend API is at http://localhost:8000/docs"
Write-Host "Simulator is at http://localhost:8001/docs"
