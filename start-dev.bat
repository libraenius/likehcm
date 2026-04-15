@echo off
chcp 65001 >nul
setlocal

REM Переход в каталог скрипта
cd /d "%~dp0"

echo [start-dev] Каталог проекта: %CD%

REM Проверка наличия Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [start-dev] Ошибка: Node.js не найден. Установите Node.js и добавьте в PATH.
    pause
    exit /b 1
)

REM Проверка node_modules
if not exist "node_modules" (
    echo [start-dev] node_modules не найден. Запускаю npm install...
    call npm install
    if %errorlevel% neq 0 (
        echo [start-dev] Ошибка установки зависимостей.
        pause
        exit /b 1
    )
)

REM Проверка Next.js
if not exist "node_modules\.bin\next.cmd" (
    echo [start-dev] Next.js не найден. Запускаю npm install...
    call npm install
    if %errorlevel% neq 0 (
        echo [start-dev] Ошибка установки зависимостей.
        pause
        exit /b 1
    )
)

echo [start-dev] Запуск Next.js dev сервера на http://localhost:3000
echo [start-dev] Для остановки нажмите Ctrl+C
echo.

call npm run dev:direct

if %errorlevel% neq 0 (
    echo.
    echo [start-dev] Сервер завершился с ошибкой. Код: %errorlevel%
    pause
    exit /b %errorlevel%
)
