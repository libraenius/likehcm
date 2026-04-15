@echo off
setlocal

cd /d "%~dp0external-reporting-service"
if errorlevel 1 (
  echo [ERROR] Could not switch to service directory.
  echo Expected path: "%~dp0external-reporting-service"
  pause
  exit /b 1
)

echo ==========================================
echo External Reporting Service launcher
echo ==========================================
echo Working directory: %CD%
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js was not found in PATH.
  echo.
  echo What to do:
  echo 1^) Install Node.js LTS from https://nodejs.org/
  echo 2^) During installation enable "Add to PATH" option
  echo 3^) Close and reopen terminal/IDE
  echo 4^) Run this .bat again
  echo.
  echo Tip: reboot is usually NOT required.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm was not found in PATH.
  echo Node.js is likely installed incorrectly or PATH is outdated in this session.
  echo.
  echo What to do:
  echo 1^) Reopen terminal/IDE and try again
  echo 2^) If still failing, reinstall Node.js LTS with PATH option enabled
  echo 3^) Check manually:
  echo    where node
  echo    where npm
  echo.
  echo Tip: reboot is usually NOT required.
  pause
  exit /b 1
)

for /f "delims=" %%v in ('node -v 2^>nul') do set NODE_VERSION=%%v
for /f "delims=" %%v in ('npm -v 2^>nul') do set NPM_VERSION=%%v
echo Node version: %NODE_VERSION%
echo npm version: %NPM_VERSION%
echo.

if not exist "node_modules" (
  echo Installing dependencies...
  npm install
  if errorlevel 1 (
    echo [ERROR] Failed to install dependencies.
    echo Check network/proxy settings and npm logs above.
    pause
    exit /b 1
  )
)

echo Starting external reporting service...
npm run dev
if errorlevel 1 (
  echo.
  echo [ERROR] Service failed to start.
  echo Check error output above.
  pause
  exit /b 1
)
