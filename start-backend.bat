@echo off
echo Starting JobTrack AI Backend Services...

:: Start the microservices in separate command prompt windows
start "API Gateway (Port 5248)" dotnet run --project services/ApiGateway
start "Auth Service (Port 5104)" dotnet run --project services/AuthService
start "Resume Service (Port 5250)" dotnet run --project services/ResumeService
start "Application Service (Port 5276)" dotnet run --project services/ApplicationService

echo.
echo All backend services have been spawned in separate windows.
echo Please keep those windows open while running the application.
echo.
pause
