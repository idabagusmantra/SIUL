@echo off
cd /d "%~dp0"
if not exist .next (echo Jalankan setup.bat terlebih dahulu. & exit /b 1)
call npm run start
