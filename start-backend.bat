@echo off
cd /d "%~dp0backend"
if not exist .venv (echo Jalankan setup.bat terlebih dahulu. & exit /b 1)
REM Mode pack (hanya klip kompetisi): set SIUL_PACK_DIR=D:\jalur\npc_extract_all sebelum menjalankan file ini.
REM Mode live (audio apa pun): jalankan setup-live.bat sekali. Model dimuat saat start (SIUL_PRELOAD=1).
if not "%SIUL_PACK_DIR%"=="" (set SIUL_EXTRACTOR=pack) else (set SIUL_EXTRACTOR=live& set SIUL_PRELOAD=1)
.venv\Scripts\python -m uvicorn main:app --host 127.0.0.1 --port 8000
