@echo off
setlocal
cd /d "%~dp0"
echo === SIUL: pemasangan satu kali ===
where node >nul 2>nul || (echo Node.js belum terpasang. Pasang Node.js 20 atau lebih baru dari https://nodejs.org lalu ulangi. & exit /b 1)
set PY=
where py >nul 2>nul && set PY=py -3
if "%PY%"=="" where python >nul 2>nul && set PY=python
if "%PY%"=="" (echo Python belum terpasang. Pasang Python 3.11 atau 3.12 dari https://python.org lalu ulangi. & exit /b 1)

if not exist backend\models\npc_open_set_pipeline.pkl (echo Berkas backend\models\npc_open_set_pipeline.pkl tidak ditemukan. & exit /b 1)
if not exist backend\.venv (%PY% -m venv backend\.venv || exit /b 1)
backend\.venv\Scripts\python -m pip install -q -r backend\requirements.txt || exit /b 1
call npm install --no-audit --no-fund || exit /b 1
call npm run build || exit /b 1
echo.
echo Selesai. Jalankan start-backend.bat lalu start-frontend.bat (di jendela terpisah), buka http://localhost:3000
