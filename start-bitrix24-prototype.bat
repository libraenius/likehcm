@echo off
chcp 65001 >nul
setlocal

REM Запуск отдельного приложения-прототипа Bitrix24
cd /d "%~dp0"

if not exist "bitrix24-portal-prototype\start-dev.bat" (
    echo [start-bitrix24-prototype] Ошибка: не найден файл bitrix24-portal-prototype\start-dev.bat
    pause
    exit /b 1
)

call "bitrix24-portal-prototype\start-dev.bat"

