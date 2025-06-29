@echo off
echo Creating comprehensive seats data for all shows...
echo.
echo Please enter the password when prompted: nYsi01VDlnuwPbMBu75eClVHQS3hSgri
echo.
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h dpg-d1gprebipnbc73b2bh3g-a -d moviebook_db -f create_comprehensive_seats.sql
echo.
echo Comprehensive seats data created successfully!
pause 