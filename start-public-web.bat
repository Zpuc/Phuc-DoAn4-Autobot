@echo off
chcp 65001 >nul
title AUTOBOT GUNDAM STORE - Public Web Launcher
cd /d "%~dp0"

echo ==============================================================
echo   KHOI DONG HE THONG GUNDAM AUTOBOT STORE (PUBLIC WEB LINK)
echo ==============================================================
echo.

:: 1. Kiem tra neu chua co ban build frontend thi build truoc
if not exist "frontend\dist\index.html" (
    echo [1/4] Dang dong goi giao dien Frontend lan dau...
    call npm run build --prefix frontend
) else (
    echo [1/4] Da co san ban build Frontend (frontend\dist).
)

:: 2. Khoi dong Backend tren cong 3000 neu chua chay
netstat -ano | findstr ":3000 " | findstr "LISTENING" >nul
if %errorlevel% neq 0 (
    echo [2/4] Dang bat Backend Server (Port 3000)...
    start "AUTOBOT - Backend (Port 3000)" cmd /k "cd /d "%~dp0" && npm run start:dev --prefix backend"
    timeout /t 5 /nobreak >nul
) else (
    echo [2/4] Backend Server (Port 3000) dang chay san.
)

:: 3. Khoi dong Frontend Preview tren cong 5173 neu chua chay
netstat -ano | findstr ":5173 " | findstr "LISTENING" >nul
if %errorlevel% neq 0 (
    echo [3/4] Dang bat Frontend Server (Port 5173)...
    start "AUTOBOT - Frontend (Port 5173)" cmd /k "cd /d "%~dp0" && npm run preview --prefix frontend"
    timeout /t 3 /nobreak >nul
) else (
    echo [3/4] Frontend Server (Port 5173) dang chay san.
)

:: 4. Kiem tra cong cu Cloudflare Tunnel va mo link cong khai
if not exist "%TEMP%\cloudflared.exe" (
    echo [4/4] Dang tai cong cu Cloudflare Tunnel ve may...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile '$env:TEMP\cloudflared.exe'"
)

echo.
echo ==============================================================
echo   DANG TAO DUONG LINK WEB CONG KHAI (*.trycloudflare.com)...
echo   Hay copy duong link https://....trycloudflare.com ben duoi
echo   de gui cho ban be truy cap tren Dien thoai hoac May tinh!
echo   (Giu cua so nay mo trong suot qua trinh su dung)
echo ==============================================================
echo.

"%TEMP%\cloudflared.exe" tunnel --url http://127.0.0.1:5173
pause
