@echo off
echo Inserting sample data into movie_booking_db...
echo.
echo Please enter the password when prompted: 8d9a6594e6fc4135ae527daf7b2b9196
echo.
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d movie_booking_db -f sample_data.sql
echo.
echo Sample data insertion completed!
pause 