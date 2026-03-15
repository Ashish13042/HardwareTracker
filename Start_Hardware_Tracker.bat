@echo off
echo 🚀 Booting up IT Inventory from INSIDE the folder...
echo.

:: 1. Start the Java Backend
echo [1/3] Starting Java Spring Boot Server...
cd backend
start /MIN mvnw spring-boot:run
cd ..

:: 2. Wait for Java to initialize (10 seconds)
echo [2/3] Waiting for database to wake up...
timeout /t 10 /nobreak > NUL

:: 3. Start the React Frontend
echo [3/3] Starting React Frontend...
cd frontend
start /MIN npm run dev

:: 4. Launch the browser
echo.
echo ✅ Success! Opening your Dashboard...
timeout /t 3 /nobreak > NUL
start http://localhost:5173

:: This keeps the window open for 5 seconds so you can see if any errors pop up
timeout /t 5 > NUL
exit