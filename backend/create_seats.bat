@echo off
echo Creating seats for all shows...
echo.
echo Please enter the password when prompted: 8d9a6594e6fc4135ae527daf7b2b9196
echo.
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d movie_booking_db -f create_seats_for_shows.sql
echo.
echo Seat creation completed!
pause 