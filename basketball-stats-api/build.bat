@echo off
echo ================================================
echo Building Basketball Stats API
echo ================================================

REM Check if Maven is installed
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Maven is not installed or not in PATH
    echo Please install Maven from https://maven.apache.org/download.cgi
    exit /b 1
)

REM Clean and build
echo.
echo Running Maven clean install...
call mvn clean install -DskipTests

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo Build successful!
    echo JAR file: target/basketball-stats-api-1.0.0.jar
    echo ================================================
) else (
    echo.
    echo ================================================
    echo Build failed! Check errors above.
    echo ================================================
    exit /b 1
)
