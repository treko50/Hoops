@echo off
echo ================================================
echo Starting Basketball Stats API
echo ================================================

REM Check if Maven is installed
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Maven is not installed or not in PATH
    echo Please install Maven from https://maven.apache.org/download.cgi
    exit /b 1
)

REM Check if serviceAccountKey.json exists
if not exist "serviceAccountKey.json" (
    echo WARNING: serviceAccountKey.json not found
    echo Please copy your Firebase credentials to this directory
    exit /b 1
)

echo.
echo Starting Spring Boot application...
echo API will be available at: http://localhost:8080
echo Swagger UI will be at: http://localhost:8080/swagger-ui.html
echo.

call mvn spring-boot:run

pause
