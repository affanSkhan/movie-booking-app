@echo off
echo Updating seat_status enum to include 'locked' status...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d movie_booking_db -f update_seat_status_enum.sql
pause 