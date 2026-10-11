@echo off
echo ============================================
echo   VKF Invoice Application - Setup
echo ============================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js v18+ from https://nodejs.org
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo.

:: Install server dependencies
echo [1/3] Installing server dependencies...
cd /d "%~dp0server"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install server dependencies.
    pause
    exit /b 1
)
echo [OK] Server dependencies installed.
echo.

:: Install client dependencies
echo [2/3] Installing client dependencies...
cd /d "%~dp0client"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install client dependencies.
    pause
    exit /b 1
)
echo [OK] Client dependencies installed.
echo.

:: Check for .env file
echo [3/3] Checking server configuration...
cd /d "%~dp0server"
if not exist ".env" (
    echo [WARN] No .env file found in server/. Creating from template...
    (
        echo PORT=5000
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_NAME=vkf_invoice
        echo DB_USER=postgres
        echo DB_PASSWORD=your_password_here
        echo JWT_SECRET=your_jwt_secret_here
    ) > .env
    echo [INFO] Created server/.env - Please edit it with your database credentials.
) else (
    echo [OK] server/.env file exists.
)
echo.

echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo Next steps:
echo   1. Set up PostgreSQL and create the database:
echo      psql -U postgres -c "CREATE DATABASE vkf_invoice;"
echo      psql -U postgres -d vkf_invoice -f database\init.sql
echo.
echo   2. Edit server\.env with your database credentials
echo.
echo   3. Start the application:
echo      - Server: cd server ^&^& npm run dev
echo      - Client: cd client ^&^& npm run dev
echo.
echo   4. Open http://localhost:5173 in your browser
echo      Login: admin / admin123
echo.
pause
