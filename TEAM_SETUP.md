# ThermalSentinel — team setup (5 minutes)

## What you need installed
- **Python 3.11+** → https://www.python.org/downloads/ (tick "Add python to PATH")
- **Node.js 20+** → https://nodejs.org/
- **Git** → https://git-scm.com/downloads

## 1. Get the code
```bash
git clone <REPO_URL> thermal-sentinel
cd thermal-sentinel
```
(or unzip `thermal-sentinel.zip` and open that folder)

> Keep the folder path short, e.g. `C:\Projects\thermal-sentinel`. Very long paths break Python DLL loading on Windows.

## 2. Backend (API + ML) — terminal 1
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000
```
First start takes ~20 s: it generates the demo archive, trains the model and classifies 22k detections.
API docs: http://127.0.0.1:8000/docs

## 3. Frontend (dashboard) — terminal 2
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

Windows shortcut: run `run.ps1` from the project root — it does steps 2 and 3 in two windows.

## 4. Live NASA data (optional)
1. Get a free key: https://firms.modaps.eosdis.nasa.gov/api/map_key/
2. `copy backend\.env.example backend\.env` → set `FIRMS_MAP_KEY=...`
3. Restart the backend → **Run pipeline** → *Live NASA FIRMS*.

## Where things are
| Path | What |
|---|---|
| `backend/app/pipeline.py` | end-to-end flow |
| `backend/app/features.py` | clustering + persistence features |
| `backend/app/classifier.py` | rules + ML + anomaly detector |
| `backend/app/osm.py` | OpenStreetMap queries |
| `backend/app/demo.py` | demo archive generator |
| `frontend/src/` | React + Leaflet dashboard |
| `docs/` | SIH idea deck, presentation deck, cheat sheet |

## Useful demo links (once both servers run)
- Jamnagar refinery with detail panel: http://localhost:5173/?lat=22.352&lng=70.049&z=12&source=c11
- Jharia coal fires: http://localhost:5173/?lat=23.74&lng=86.42&z=12
- Punjab stubble burning: http://localhost:5173/?lat=30.55&lng=75.7&z=9

## Troubleshooting
- **Red badge "Backend API not running"** → terminal 1 is not running or crashed; read its output.
- **"DLL load failed … Application Control policy"** → Windows Smart App Control is blocking Python packages. Windows Security → App & browser control → Smart App Control → Off.
- **Port already in use** → change `--port` / vite port, or close the other process.
