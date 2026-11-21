@echo off
setlocal
cd /d "%~dp0"
echo === SIUL: pemasangan ekstraktor audio (sekali, unduhan beberapa GB) ===
if not exist backend\.venv (echo Jalankan setup.bat terlebih dahulu. & exit /b 1)
set PYV=backend\.venv\Scripts\python
%PYV% -m pip install -q torch --index-url https://download.pytorch.org/whl/cpu || exit /b 1
%PYV% -m pip install -q -r backend\requirements-live.txt || exit /b 1
%PYV% backend\scripts\download_models.py || exit /b 1
echo.
echo Selesai. Cek ketepatan dengan: backend\.venv\Scripts\python backend\scripts\verify_live.py --pack D:\npc_extract_all --audio D:\schematics-2026\train\audio
echo Lalu jalankan start-backend.bat dan start-frontend.bat.
