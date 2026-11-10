@echo off
chcp 65001 >nul
title AUTOBOT GUNDAM STORE - Public Web Launcher
cd /d "%~dp0"

echo ==============================================================
echo   KHOI DONG HE THONG GUNDAM AUTOBOT STORE - PUBLIC WEB LINK
echo ==============================================================
echo.

if exist "frontend\dist\index.html" goto SKIP_BUILD
echo [1/4] Dang dong goi giao dien Frontend lan dau...
call npm run build --prefix frontend
goto CHECK_BACKEND

:SKIP_BUILD
echo [1/4] Da co san ban build Frontend tai frontend\dist.

:CHECK_BACKEND
netstat -ano | findstr ":3000 " | findstr "LISTENING" >nul
if not errorlevel 1 goto BACKEND_RUNNING
echo [2/4] Dang bat Backend Server [Port 3000]...
start "AUTOBOT - Backend" cmd /k "cd /d "%~dp0" && npm run start:dev --prefix backend"
timeout /t 5 /nobreak >nul
goto CHECK_FRONTEND

:BACKEND_RUNNING
echo [2/4] Backend Server [Port 3000] dang chay san.

:CHECK_FRONTEND
netstat -ano | findstr ":5173 " | findstr "LISTENING" >nul
if not errorlevel 1 goto FRONTEND_RUNNING
echo [3/4] Dang bat Frontend Server [Port 5173]...
start "AUTOBOT - Frontend" cmd /k "cd /d "%~dp0" && npm run preview --prefix frontend"
timeout /t 3 /nobreak >nul
goto CHECK_TUNNEL

:FRONTEND_RUNNING
echo [3/4] Frontend Server [Port 5173] dang chay san.

:CHECK_TUNNEL
if exist "%TEMP%\cloudflared.exe" goto RUN_TUNNEL
echo [4/4] Dang tai cong cu Cloudflare Tunnel ve may...
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile '$env:TEMP\cloudflared.exe'"

:RUN_TUNNEL
echo.
echo ==============================================================
echo   DANG TAO DUONG LINK WEB CONG KHAI [*.trycloudflare.com]...
echo   Hay copy duong link https://....trycloudflare.com ben duoi
echo   de gui cho ban be truy cap tren Dien thoai hoac May tinh!
echo   [Giu cua so nay mo trong suot qua trinh su dung]
echo ==============================================================
echo.

"%TEMP%\cloudflared.exe" tunnel --url http://127.0.0.1:5173
pause
