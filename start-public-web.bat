@echo off
chcp 65001 >nul
title AUTOBOT GUNDAM STORE - Public Web Launcher
cd /d "%~dp0"

node scripts/start-public.mjs
pause
