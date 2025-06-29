@echo off
echo Creating comprehensive seats data...
echo.
echo Running SQL script...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h dpg-d1gprebipnbc73b2bh3g-a -d moviebook_db -f create_comprehensive_seats.sql
echo.
echo Seats data created!
pause 